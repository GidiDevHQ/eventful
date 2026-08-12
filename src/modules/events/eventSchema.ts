import { title } from "node:process"
import { z } from "zod"
import { datetime } from "zod/v4/core/regexes.cjs"

export const createEventSchema = z.object({
    body: z.object({
        title: z
        .string({ error: "Event title is required" })
        .min(3, "Title must be at least 3 characters long")
        .max(150, "Title cannot exceed 150 characters"),

        description: z
        .string({ error: "Event description is required" })
        .min(10, "Description must be at least 10 characters long"),

        venue: z
        .string({ error: "Venue location is required" })
        .min(2, "Venue must be at least 2 characters long"),

        coverImageUrl: z
        .url("Cover image must be a valid URL string")
        .optional(),

        price: z
        .number({ error: "Ticket price is required" })
        .int("Capacity must bne a whole integer number")
        .positive("Event capacity must be at least 1 person")
        .optional(),

        startsAt: z
        .string({ error: "Event start date and time are required" })
        .datetime({ message: "Invalid start date format. Expected an ISO-8601 string" }),

        endsAt: z
        .string()
        .datetime({ message: "Invalid end date format. Expected an ISO-8601 string" })
        .optional(),

        defaultReminderOffsets: z
        .array(
            z.number().int()
            .positive()
        )
        .optional(),
    }),
}).refine(
  (data) => {
    if (!data.body.endsAt) return true;
    return new Date(data.body.endsAt) > new Date(data.body.startsAt);
  },
  {
    message: "Event end time (endsAt) must occur after the start time (startsAt)",
    path: ["body", "endsAt"],
  }
);

const rawUpdateBodySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long").max(150, "Title cannot exceed 150 characters"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  venue: z.string().min(2, "Venue must be at least 2 characters long"),
  coverImageUrl: z.string().url("Cover image must be a valid URL string").optional(),
  price: z.number().int("Price must be a whole number in Kobo/Cents").nonnegative("Ticket price cannot be negative"),
  capacity: z.number().int("Capacity must be a whole integer number").positive("Event capacity must be at least 1 person"),
  startsAt: z.string().datetime({ message: "Invalid start date format. Expected an ISO-8601 string" }),
  endsAt: z.string().datetime({ message: "Invalid end date format. Expected an ISO-8601 string" }),
  defaultReminderOffsets: z.array(z.number().int().positive()),
});

export const updateEventSchema = z.object({
    body: rawUpdateBodySchema.partial(),

     params: z.object({
    id: z.string({ error: "Event ID is required" }).uuid("Invalid Event ID format. Expected a standard UUIDv4"),
  }),
}). refine(
  /** Chronological Guardrail: Double checks date parameters if BOTH are submitted inside a PATCH update */
  (data) => {
    if (!data.body.startsAt || !data.body.endsAt) return true;
    return new Date(data.body.endsAt) > new Date(data.body.startsAt);
  },
  {
    message: "Event end time (endsAt) must occur after the start time (startsAt)",
    path: ["body", "endsAt"],
  }
);

export const eventIdParamSchema = z.object({
  params: z.object({
    id: z.string({ error: "Event ID is required" }).uuid("Invalid Event ID format. Expected a standard UUIDv4"),
  }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>["body"];
export type UpdateEventInput = z.infer<typeof updateEventSchema>["body"];