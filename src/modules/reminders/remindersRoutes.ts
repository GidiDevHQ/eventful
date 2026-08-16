import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { addReminderSchema } from "./remindersSchema";
import * as remindersController from "./remindersController";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("EVENTEE"),
  validate(addReminderSchema),
  remindersController.addCustomReminder
);

router.get("/mine", requireAuth, requireRole("EVENTEE"), remindersController.listMyReminders);

router.delete("/:id", requireAuth, requireRole("EVENTEE"), remindersController.cancelReminder);

export default router;