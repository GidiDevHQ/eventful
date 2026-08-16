import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { reminderQueue, ReminderJobData } from "../../jobs/reminderQueue";

async function scheduleReminderJob(reminder: {
    id: string;
    userId: string;
    eventId: string;
    offsetMinutes: number;
}, eventStartsAt: Date, eventTitle: string) {
    const fireAt = new Date(eventStartsAt.getTime() - reminder.offsetMinutes * 60 * 1000)

    const delay = fireAt.getTime() - Date.now();
    if (delay <= 0) {
        return null;
    }

    const job = await reminderQueue.add(
        "send-reminder",
        {
            reminderId: reminder.id,
            userId: reminder.userId,
            eventId: reminder.eventId,
            eventTitle,
        } satisfies ReminderJobData,

        { delay }
    );

    return job.id ?? null
}

export async function createEventDefaultReminders(eventId: string) {
    return;
}

export async function scheduleRemindersForTicket(userId: string, eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Event not found", 404);

    const jobIds: string[] = [];

    for (const offsetMinutes of event.defaultReminderOffsets) {
        const reminder = await prisma.reminder.upsert({
            where: {
                userId_eventId_offsetMinutes: { userId, eventId, offsetMinutes },
            },
            create: { userId, eventId, offsetMinutes },
            update: {},
        });

        const jobId = await scheduleReminderJob(reminder, event.startsAt, event.title);
        if (jobId) {
          await prisma.reminder.update({ where: { id: reminder.id }, data: { bullJobId: jobId } });
          jobIds.push(jobId);
        }
    }

    return jobIds;
}

export async function addCustomReminder(userId: string, eventId: string, offsetMinutes: number) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Event not found", 404); 
    const reminder = await prisma.reminder.upsert({
        where: { userId_eventId_offsetMinutes: { userId, eventId, offsetMinutes } },
        create: { userId, eventId, offsetMinutes },
        update: {},
    }); 
    const jobId = await scheduleReminderJob(reminder, event.startsAt, event.title);
    if (jobId) {
        await prisma.reminder.update({ where: { id: reminder.id }, data: { bullJobId: jobId } });
    }   
    return reminder;
   
}

export async function listMyReminders(userId: string) {
    return prisma.reminder.findMany({
        where: { userId },
        include: { event: { select: { id: true, title: true, startsAt: true } } },
        orderBy: { createdAt: "desc" },
    });
}

export async function cancelReminder(userId: string, reminderId: string) {
    const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
    if (!reminder) throw new AppError("Reminder not found", 404);
    if (reminder.userId !== userId) throw new AppError("Not your reminder", 403);   
    if (reminder.bullJobId) {
        const job = await reminderQueue.getJob(reminder.bullJobId);
        if (job) await job.remove();
  }

  await prisma.reminder.delete({ where: { id: reminderId } });
}