import express from "express";
import cors from "cors";
import helmet from "helmet"
import { generateLimiter } from "./middleware/rateLimiter";
import { notFoundHandler,globalErrorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/authRoutes";
import eventsRoutes from "./modules/events/eventsRoutes"
import ticketsRoutes from "./modules/tickets/ticketsRoutes"
import paymentRoutes from "./modules/payments/paymentsRoutes"
import * as paymentsController from "./modules/payments/paymentsController"

export const app = express();

app.use(helmet());

app.use(cors())

app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentsController.webhook
);

app.use(express.json());

app.use(generateLimiter);

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/events", eventsRoutes)
app.use("/api/v1/tickets", ticketsRoutes)
app.use("/api/v1/payments", paymentRoutes)

app.use(notFoundHandler);
app.use(globalErrorHandler);

