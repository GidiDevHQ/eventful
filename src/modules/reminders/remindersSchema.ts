import { z } from "zod";

export const addReminderSchema = z.object({
    body: z.object({
      eventId: z.uuid(),
      offsetMinutes: z.number().int().positive(),
    }),
});