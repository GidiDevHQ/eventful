import { Request, Response } from "express";
import { catchAsync } from "../../utils/AppError";
import * as remindersService from "./remindersService";

export const addCustomReminder = catchAsync(async (req: Request, res: Response) => {
    const reminder = await remindersService.addCustomReminder(
        req.user!.id,
        req.body.eventId,
        req.body.offsetMinutes
    );
    res.status(201).json({ status: "success", data: reminder });
});

export const listMyReminders = catchAsync(async (req: Request, res: Response) => {
    const reminders = await remindersService.listMyReminders(req.user!.id);
    res.status(200).json({ status: "success", data: reminders });
});

export const cancelReminder = catchAsync(async (req: Request, res: Response) => {
    const reminderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!reminderId) {
        throw new Error("Reminder id is required");
    }

    await remindersService.cancelReminder(req.user!.id, reminderId);
    res.status(204).send();
});