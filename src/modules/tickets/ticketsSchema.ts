import { z } from "zod";

export const applyEventSchema = z.object({
    body: z.object({
        eventId: z.uuid(),
    }),
});

export const verifyTicketSchema = z.object({
    body: z.object({
        qrCodeToken: z.string().min(1),
    }),
});

export const ticketIdParamSchema = z.object({
    params: z.object({ id: z.uuid() }),
});
export type ApplyForEventInput = z.infer<typeof applyEventSchema>["body"]
