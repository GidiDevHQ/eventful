import { Request, Response } from "express";
import { catchAsync } from "../../utils/AppError";
import * as analyticsService from "./analyticsService";

export const getCreatorOverview = catchAsync(async (req: Request, res: Response) => {
  const overview = await analyticsService.getCreatorOverview(req.user!.id);
  res.status(200).json({ status: "success", data: overview });
});

export const getEventAnalytics = catchAsync(async (req: Request, res: Response) => {
  const eventId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!eventId) {
    throw new Error("Event id is required");
  }

  const analytics = await analyticsService.getEventAnalytics(req.user!.id, eventId);
  res.status(200).json({ status: "success", data: analytics });
});