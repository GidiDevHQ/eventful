import { Request, Response } from "express";
import { catchAsync } from "@/utils/AppError";
import * as paymentsService from "./paymentsService";

export const initializePayment = catchAsync(async (req: Request, res: Response) => {
    const result = await paymentsService.initializePayment(req.user!.id, req.body.ticketId);
    res.status(200).json({ status: "success", data: result });
});

export const webhook = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers["x-paystack-signature"] as string;
    const result = await paymentsService.handlePaystackWebhook(req.body, signature);
    res.status(200).json(result)
});

export const listPayments = catchAsync(async (req: Request, res: Response) => {
    const payments = await paymentsService.listPaymentForCreator(req.user!.id);
    res.status(200).json({ status: "success", data: payments })
});