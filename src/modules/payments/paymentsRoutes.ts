import { Router } from "express";
import express from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { paymentLimiter } from "@/middleware/rateLimiter";
import { initializePaymentSchema } from "./paymentsSchema";
import * as paymentsController from "./paymentsController";

const router = Router();

/**
 * @openapi
 * /api/v1/payments/initialize:
 *   post:
 *     tags: [Payments]
 *     summary: Initialize a Paystack transaction for a pending ticket (eventee only)
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/initialize",
    requireAuth,
    requireRole("EVENTEE"),
    validate(initializePaymentSchema),
    paymentsController.initializePayment
);

/**
 * @openapi
 * /api/v1/payments/mine:
 *   get:
 *     tags: [Payments]
 *     summary: List all payments across events owned by the logged-in creator
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/mine",
    requireAuth,
    requireRole("CREATOR"),
    paymentsController.listPayments
);

export default router;