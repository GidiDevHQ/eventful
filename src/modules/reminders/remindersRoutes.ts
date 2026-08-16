import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { addReminderSchema } from "./remindersSchema";
import * as remindersController from "./remindersController";

const router = Router();

/**
 * @openapi
 * /api/v1/reminders:
 *   post:
 *     tags: [Reminders]
 *     summary: Set a custom reminder offset for an event (eventee only)
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  requireAuth,
  requireRole("EVENTEE"),
  validate(addReminderSchema),
  remindersController.addCustomReminder
);

/**
 * @openapi
 * /api/v1/reminders/mine:
 *   get:
 *     tags: [Reminders]
 *     summary: List all reminders set by the logged-in eventee
 *     security:
 *       - bearerAuth: []
 */
router.get("/mine", requireAuth, requireRole("EVENTEE"), remindersController.listMyReminders);

/**
 * @openapi
 * /api/v1/reminders/{id}:
 *   delete:
 *     tags: [Reminders]
 *     summary: Cancel a reminder
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", requireAuth, requireRole("EVENTEE"), remindersController.cancelReminder);

export default router;