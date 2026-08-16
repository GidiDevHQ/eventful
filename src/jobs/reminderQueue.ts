import { Queue } from "bullmq";
import { redis } from "../config/redis"

export const reminderQueue = new Queue("reminders", {
    connection: redis,
});

export interface ReminderJobData {
    reminderId: string;
    userId: string;
    eventId: string;
    eventTitle: string;
}