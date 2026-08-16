import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { cached } from "../../utils/cache";

const ANALYTICS_TTL = 120;

export async function getCreatorOverview(creatorId: string) {
  const cacheKey = `analytics:creator:${creatorId}:overview`;

  return cached(cacheKey, ANALYTICS_TTL, async () => {
    const [totalEvents, totalTicketsSold, totalRevenue, totalScanned] = await Promise.all([
      prisma.event.count({ where: { creatorId } }),

      prisma.ticket.count({
        where: { event: { creatorId }, status: { in: ["PAID", "USED"] } },
      }),

      prisma.payment.aggregate({
        where: { ticket: { event: { creatorId } }, status: "SUCCESS" },
        _sum: { amount: true },
      }),

      prisma.ticket.count({
        where: { event: { creatorId }, status: "USED" },
      }),
    ]);

    return {
      totalEvents,
      totalTicketsSold,
      totalRevenue: totalRevenue._sum.amount ?? 0,
      totalScanned,
    };
  });
}

export async function getEventAnalytics(creatorId: string, eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError("Event not found", 404);
  if (event.creatorId !== creatorId) throw new AppError("Not your event", 403);

  const cacheKey = `analytics:event:${eventId}`;

  return cached(cacheKey, ANALYTICS_TTL, async () => {
    const [ticketsBought, ticketsScanned, revenue] = await Promise.all([
      prisma.ticket.count({
        where: { eventId, status: { in: ["PAID", "USED"] } },
      }),

      prisma.ticket.count({
        where: { eventId, status: "USED" },
      }),

      prisma.payment.aggregate({
        where: { ticket: { eventId }, status: "SUCCESS" },
        _sum: { amount: true },
      }),
    ]);

    return {
      eventId,
      eventTitle: event.title,
      ticketsBought,
      ticketsScanned,
      scanRate: ticketsBought > 0 ? Math.round((ticketsScanned / ticketsBought) * 100) : 0,
      revenue: revenue._sum.amount ?? 0,
      capacity: event.Capacity,
    };
  });
}