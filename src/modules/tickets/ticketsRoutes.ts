import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { applyForEventSchema, verifyTicketSchema } from "./ticketsSchema";
import * as ticketsController from "./ticketsControllers";

const router = Router();

router.post(
  "/apply",
  requireAuth,
  requireRole("EVENTEE"),
  validate(applyForEventSchema),
  ticketsController.applyForEvent
);

router.get("/mine", requireAuth, requireRole("EVENTEE"), ticketsController.listMyTickets);

router.post(
  "/verify",
  requireAuth,
  requireRole("CREATOR"),
  validate(verifyTicketSchema),
  ticketsController.verifyAndScanTicket
);
// this is your "scan at the door" endpoint — creator-only, since they're
// the one physically checking people in

export default router;