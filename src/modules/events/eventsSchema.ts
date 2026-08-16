import { z } from "zod";

// Creation and update payloads validate event metadata before storing the record or changing ownership-sensitive fields.
export const createEventSchema = z
  .object({
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

      coverImageUrl: z.url("Cover image must be a valid URL string").optional(),

      price: z
        .number({ error: "Ticket price is required" })
        .int("Price must be a whole number")
        .nonnegative("Ticket price cannot be negative"),

      capacity: z
        .number({ error: "Event capacity is required" })
        .int("Capacity must be a whole integer number")
        .positive("Event capacity must be at least 1 person")
        .optional(),

      startsAt: z
        .string({ error: "Event start date and time are required" })
        .datetime({ message: "Invalid start date format. Expected an ISO-8601 string" }),

      endsAt: z
        .string({ error: "Event end date and time are required" })
        .datetime({ message: "Invalid end date format. Expected an ISO-8601 string" }),

      defaultReminderOffsets: z.array(z.number().int().positive()).optional(),
    }),
  })
  .refine((data) => new Date(data.body.endsAt) > new Date(data.body.startsAt), {
    message: "Event end time (endsAt) must occur after the start time (startsAt)",
    path: ["body", "endsAt"],
  });

const rawUpdateBodySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long").max(150, "Title cannot exceed 150 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters long").optional(),
  venue: z.string().min(2, "Venue must be at least 2 characters long").optional(),
  coverImageUrl: z.string().url("Cover image must be a valid URL string").optional(),
  price: z.number().int("Price must be a whole number in Kobo/Cents").nonnegative("Ticket price cannot be negative").optional(),
  capacity: z.number().int("Capacity must be a whole integer number").positive("Event capacity must be at least 1 person").optional(),
  startsAt: z.string().datetime({ message: "Invalid start date format. Expected an ISO-8601 string" }).optional(),
  endsAt: z.string().datetime({ message: "Invalid end date format. Expected an ISO-8601 string" }).optional(),
  defaultReminderOffsets: z.array(z.number().int().positive()).optional(),
});

export const updateEventSchema = z
  .object({
    body: rawUpdateBodySchema.partial(),
    params: z.object({
      id: z
        .string({ error: "Event ID is required" })
        .min(1, "Event ID is required")
        .refine(
          (value) => {
            const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
            return isUuid;
          },
          "Invalid Event ID format. Expected a standard UUIDv4"
        ),
    }),
  })
  .refine(
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
    id: z.string({ error: "Event ID is required" }).min(1, "Event ID is required"),
  }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>["body"];
export type UpdateEventInput = z.infer<typeof updateEventSchema>["body"];