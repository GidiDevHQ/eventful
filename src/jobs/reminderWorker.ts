import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { ReminderJobData } from "./reminderQueue";
import { prisma } from "../config/prisma";

export const reminderWorker = new Worker<ReminderJobData>(
  "reminders",
  async (job: Job<ReminderJobData>) => {
    const { userId, eventId, eventTitle } = job.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    console.log(
      `🔔 REMINDER: Hey ${user.name}, "${eventTitle}" is coming up! (sent to ${user.email})`
    );

  },
  { connection: redis }
);

reminderWorker.on("completed", (job) => {
  console.log(`✅ Reminder job ${job.id} completed`);
});

reminderWorker.on("failed", (job, err) => {
  console.error(`❌ Reminder job ${job?.id} failed:`, err.message);
});