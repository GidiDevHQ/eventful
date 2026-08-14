import { Request, Response } from "express";
import { catchAsync } from "../../utils/AppError";
import * as ticketsService from "./ticketsService";

export const applyForEvent = catchAsync(async (req: Request, res: Response) => {
  const ticket = await ticketsService.applyForEvent(req.user!.id, req.body.eventId);
  res.status(201).json({ status: "success", data: ticket });
});

export const verifyAndScanTicket = catchAsync(async (req: Request, res: Response) => {
  const result = await ticketsService.verifyAndScanTicket(req.user!.id, req.body.qrCodeToken);
  res.status(200).json({ status: "success", data: result });
});

export const listMyTickets = catchAsync(async (req: Request, res: Response) => {
  const tickets = await ticketsService.listMyTickets(req.user!.id);
  res.status(200).json({ status: "success", data: tickets });
});