import { z } from "zod";

export const initializePaymentSchema = z.object({
    body: z.object({
        ticketId: z.uuid(),
    }),
});