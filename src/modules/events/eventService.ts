import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { cached, invalidateByPrefix } from "../../utils/cache";
import { slugify } from "@/utils/slugify";
import { env } from "@/config/env";
import { CreateEventInput, UpdateEventInput } from "./eventSchema";
import { promise } from "zod";

const EVENT_LIST_TTL = 60;
const EVENT_DETAIL_TTL = 120;

function stripUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(value).filter(([, item]) => item !== undefined)
    ) as Partial<T>;
}

export async function createEvent(creatorId: string, input: CreateEventInput) {
    const data = stripUndefined({
        ...input,
        slug: slugify(input.title),
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        coverImageUrl: input.coverImageUrl ?? null,
        defaultReminderOffsets: input.defaultReminderOffsets ?? [1440],
        creatorId,
    });

    const event = await prisma.event.create({
        data: data as any,
    });

    await invalidateByPrefix("events:list");
    return event;
}

export async function updateEvent(creatorId: string, eventId: string, input: UpdateEventInput) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Event not found", 404);
    if (event.creatorId !== creatorId) throw new AppError("Not your event", 403);

    const data = stripUndefined({
        ...input,
        ...(input.startsAt ? { startsAt: new Date(input.startsAt) } : {}),
        ...(input.endsAt ? { endsAt: new Date(input.endsAt) } : {}),
    });

    const updated = await prisma.event.update({
        where: { id: eventId },
        data: data as any,
    });

    await invalidateByPrefix("events:list");
    await invalidateByPrefix(`events:details:${eventId}`);

    return updated;
}

export async function listUpcomingEvents(page = 1, pageSize = 20) {
    const cacheKey = `events:list:page=${page}:size=${pageSize}`;

    return cached(cacheKey, EVENT_LIST_TTL, async () => {
        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where: { startsAt: { gte: new Date() } },
                orderBy: { startsAt: "asc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: { creator: { select: { id: true, name: true } } },
            }),
            prisma.event.count({ where: { startsAt: new Date() } }),
        ]);
        return { events, total, page, pageSize }
    })
}

export async function getEventBySlugOrId(idOrSlug: string) {
    const cacheKey = `events:detail:${idOrSlug}`;

    const event = await cached(cacheKey, EVENT_DETAIL_TTL, () => 
        prisma.event.findFirst({
            where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
            include: { creator: { select: { id: true, name: true } } },
        })
    );

    if (!event) throw new AppError("Event not found", 404);
    return event
}

export async function listApplicants(creatorId: string, eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Event not found", 404);
    if (event.creatorId !== creatorId) throw new AppError("Not your event", 403);

    return prisma.ticket.findMany({
        where: { eventId },
        include: {
            user: { select: { id: true, name: true, email: true } },
            payment: true,
        },
        orderBy: { createdAt: "desc" }
    });
}

export function buildShareLinks(eventSlug: string, title: string) {
    const url = `${env.frontendBaseUrl}/events/${eventSlug}`;
    const text = encodeURIComponent(`Check out "${title}" on Eventful`)
    const encodedUrl = encodeURIComponent(url);

    return {
        url,
        whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };
}