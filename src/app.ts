import express from "express";
import cors from "cors";
import helmet from "helmet"
import { generateLimiter } from "./middleware/rateLimiter";
import { notFoundHandler,globalErrorHandler } from "./middleware/errorHandler";
import { generatePrime } from "node:crypto";
import authRoutes from "./modules/auth/authRoutes";

export const app = express();

app.use(helmet());

app.use(cors())

app.use(express.json());

app.use(generateLimiter);

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes)

app.use(notFoundHandler);
app.use(globalErrorHandler);

