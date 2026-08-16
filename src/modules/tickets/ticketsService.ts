import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { generateTicketToken, generateQrCodeDataUrl } from "@/utils/qrcode";
import { invalidateByPrefix } from "@/utils/cache";
import { scheduleRemindersForTicket } from "@/modules/reminders/remindersService";

// Reserve a ticket for a user after checking event validity, capacity, and duplicate purchase rules.
export async function applyForEvent(userId: string, eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Event not found", 404);

    if (event.startsAt < new Date()) {
        throw new AppError("This event has already happened", 404);
    }

    if (event.Capacity !== null) {
        const ticketCount = await prisma.ticket.count({
            where: { eventId, status: { in: ["PENDING", "PAID"] } },
        });

        if (ticketCount >= event.Capacity) {
            throw new AppError("This event is fully booked", 404);
        }
    }

    const existing = await prisma.ticket.findFirst({
        where: { eventId, userId, status: { in: ["PENDING", "PAID"] } },
    });
    if (existing) {
        throw new AppError("You already have a ticket for this event", 409);
    }

    const ticketToken = generateTicketToken();
    const qrCodeUrl = await generateQrCodeDataUrl(ticketToken);

    const ticket = await prisma.ticket.create({
        data: {
            eventId,
            userId,
            status: "PENDING",
            qrCodeToken: ticketToken,
            qrCodeUrl,
            scannedAt: new Date(0),
        },
    });

    return ticket;
}

// Mark a ticket as paid, generate a fresh QR code, and schedule follow-up reminders for the event.
export async function confirmTicketPayment(ticketId: string) {
    const token = generateTicketToken();
    const qrCodeUrl = await generateQrCodeDataUrl(token);

    const ticket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
            status: "PAID",
            qrCodeToken: token,
            qrCodeUrl,
        },
    });

    await scheduleRemindersForTicket(ticket.userId, ticket.eventId)

    await invalidateByPrefix(`analytics:event:${ticket.eventId}`);

    return ticket;
}

// Validate a QR ticket, ensure it belongs to the scanning creator, and mark it as used once.
export async function verifyAndScanTicket(scannerId: string, qrCodeToken: string) {
    const ticket = await prisma.ticket.findUnique({
        where: { qrCodeToken },
        include: { event: true, user: { select: { id: true, name: true, email: true } } },
    });

    if (!ticket) throw new AppError("Invalid ticket - QR code not recognized", 404);

    if (ticket.event.creatorId !== scannerId) {
        throw new AppError("You can only scan tickets for your own events", 403);
    }

    if (ticket.status === "USED") {
        throw new AppError("This ticket has already been scanned", 409);
    }

    if (ticket.status !== "PAID") {
        throw new AppError("This ticket has not been paid for", 400)
    }

    const updated = await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: "USED", scannedAt: new Date() },
    });
    await invalidateByPrefix(`analytics:event:${ticket.eventId}`)

    return { ...updated, event: ticket.event, user: ticket.user };
}

// Fetch a user's ticket history including the linked event and payment record for the dashboard.
export async function listMyTickets(userId: string) {
    return prisma.ticket.findMany({
        where: { userId },
        include: { event: true, payment: true },
        orderBy: { createdAt: "desc" }
    })
}

