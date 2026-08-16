import express from "express";
import cors from "cors";
import helmet from "helmet"
import { generateLimiter } from "./middleware/rateLimiter";
import { notFoundHandler,globalErrorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/authRoutes";
import eventsRoutes from "./modules/events/eventsRoutes";
import ticketsRoutes from "./modules/tickets/ticketsRoutes";
import paymentRoutes from "./modules/payments/paymentsRoutes";
import * as paymentsController from "./modules/payments/paymentsController";
import analyticsRoutes from "./modules/analytics/analyticsRoutes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

export const app = express();

// Apply security headers and CORS before any route logic so every request is protected consistently.
app.use(helmet());
app.use(cors());

// The Paystack webhook payload must be read as raw JSON because the signature is verified against the raw body.
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentsController.webhook
);

app.use(express.json());

// Global request throttling protects auth and payment routes without hiding real validation errors in tests.
app.use(generateLimiter);

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventsRoutes);
app.use("/api/v1/tickets", ticketsRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFoundHandler);
app.use(globalErrorHandler);

