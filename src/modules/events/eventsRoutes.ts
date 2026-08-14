import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { generateLimiter } from "@/middleware/rateLimiter";
import {
    createEventSchema,
    eventIdParamSchema,
    updateEventSchema,
} from "./eventsSchema";
import * as eventsController from "./eventsController";

const router = Router()

/**
 * @openapi
 * /api/v1/events:
 * get:
 * tags: [Events]
 * summary: List all upcoming events (public)
 */
router.get("/", generateLimiter, eventsController.listUpcomingEvents);

/**
 * @openapi
 * /api/v1/events/mine:
 * get:
 * tags: [Events]
 * summary: List events created by the logged-in creator
 */
router.get(
    "/mine",
    requireAuth,
    requireRole("CREATOR"),
    eventsController.listMyCreatedEvents
);

/**
 * @openapi
 * /api/v1/events/{id}:
 * get:
 * tags: [Events]
 * summary: Get a single event by id or slug (public)
 */
router.get("/:id", generateLimiter, eventsController.getEvent);

/**
 * @openapi
 * /api/v1/events/{id}/share:
 * get:
 * tags: [Events]
 * summary: Get pre-built social
 */
router.get("/:id/share", eventsController.getShareLinks);

/**
 * @openapi
 * /api/v1/events:
 * post:
 * tags: [Events]
 * summary: Create a new event (creator only)
 */
router.post(
    "/",
    requireAuth,
    requireRole("CREATOR"),
    validate(createEventSchema),
    eventsController.createEvent
);

/**
 * @openapi
 * /api/v1/events/{:id}:
 * patch:
 * tags: [Events]
 * summary: Update an event (creator only, must own the event)
 */
router.patch(
    "/:id",
    requireAuth,
    requireRole("CREATOR"),
    validate(updateEventSchema),
    eventsController.updateEvent
);

/**
 * @openapi
 * /api/v1/events/{:id}/applicants:
 * patch:
 * tags: [Events]
 * summary: Update an event (creator only, must own the event)
 */
router.get(
    "/:id/applicants",
    requireAuth,
    requireRole("CREATOR"),
    validate(eventIdParamSchema),
    eventsController.listApplicants
);

export default router;