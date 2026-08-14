import { Request, Response } from "express";
import { catchAsync } from "@/utils/AppError";
import * as eventsService from "./eventsService";

export const createEvent = catchAsync(async (req: Request, res: Response) => {
    const event = await eventsService.createEvent(req.user!.id, req.body);
    res.status(201).json({ status: "success", data: event })
});

export const updateEvent = catchAsync(async (req: Request, res: Response) => {
    const eventId = String(req.params.id);
    const event = await eventsService.updateEvent(req.user!.id, eventId, req.body);
    res.status(200).json({ status: "success", data: event })
});

export const listUpcomingEvents = catchAsync(async (req:Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const result = await eventsService.listUpcomingEvents(page, pageSize);
    res.status(200).json({ status: "success", data: result })
});

export const getEvent = catchAsync(async (req: Request, res: Response) => {
    const eventIdOrSlug = String(req.params.id);
    const event = await eventsService.getEventBySlugOrId(eventIdOrSlug);
    res.status(200).json({ status: "success", data: event });
});

export const listMyCreatedEvents = catchAsync(async (req: Request, res: Response) => {
    const events = await eventsService.listEventsByCreator(req.user!.id);
    res.status(200).json({ status: "success", data: events });
});

export const listApplicants = catchAsync(async (req:Request, res: Response) => {
    const eventId = String(req.params.id);
    const applicants = await eventsService.listApplicants(req.user!.id, eventId);
    res.status(200).json({ status: "success", data: applicants })
});

export const getShareLinks = catchAsync(async (req: Request, res: Response) => {
  const eventIdOrSlug = String(req.params.id);
  const event = await eventsService.getEventBySlugOrId(eventIdOrSlug);
  const links = eventsService.buildShareLinks(event.slug, event.title);
  res.status(200).json({ status: "success", data: links });
});