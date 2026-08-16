import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { applyForEventSchema, verifyTicketSchema } from "./ticketsSchema";
import * as ticketsController from "./ticketsControllers";

const router = Router();

/**
 * @openapi
 * /api/v1/tickets/apply:
 *   post:
 *     tags: [Tickets]
 *     summary: Apply for / buy a ticket to an event (eventee only)
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/apply",
  requireAuth,
  requireRole("EVENTEE"),
  validate(applyForEventSchema),
  ticketsController.applyForEvent
);

/**
 * @openapi
 * /api/v1/tickets/mine:
 *   get:
 *     tags: [Tickets]
 *     summary: List all tickets belonging to the logged-in eventee
 *     security:
 *       - bearerAuth: []
 */
router.get("/mine", requireAuth, requireRole("EVENTEE"), ticketsController.listMyTickets);

/**
 * @openapi
 * /api/v1/tickets/verify:
 *   post:
 *     tags: [Tickets]
 *     summary: Scan and verify a ticket's QR code at event entry (creator only)
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/verify",
  requireAuth,
  requireRole("CREATOR"),
  validate(verifyTicketSchema),
  ticketsController.verifyAndScanTicket
);

export default router;