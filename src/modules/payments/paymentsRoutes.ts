import { Router } from "express";
import express from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { paymentLimiter } from "@/middleware/rateLimiter";
import { initializePaymentSchema } from "./paymentsSchema";
import * as paymentsController from "./paymentsController";

const router = Router();

router.post(
    "/initialize",
    requireAuth,
    requireRole("EVENTEE"),
    validate(initializePaymentSchema),
    paymentsController.initializePayment
);

router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    paymentsController.webhook
);

router.get(
    "/mine",
    requireAuth,
    requireRole("CREATOR"),
    paymentsController.listPayments
);

export default router;