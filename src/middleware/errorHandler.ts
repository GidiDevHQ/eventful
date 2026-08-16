import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

// Turn unknown routes into a consistent 404 response instead of letting Express fall through silently.
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

type ErrorWithMeta = Error & {
    statusCode?: number;
    isOperational?: boolean;
    cause?: unknown;
    stack?: string;
}

// Centralize API error formatting so validation, auth, Prisma, and app exceptions all return a predictable payload.
export function globalErrorHandler(
  err: ErrorWithMeta,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong internal server error";

  if (env.nodeEnv === "development") {
    res.status(statusCode).json({
      success: false,
      message,
      errors: err.cause || undefined,
      stack: err.stack,
      error: err,
    });
    return;
  }

 if (err instanceof AppError) {
    const appError = err as AppError;

    res.status(appError.statusCode).json({
        success: false,
        message,
        ...(appError.cause ? { cause: appError.cause } : {}),
    })
 }

  console.error("CRITICAL BUG MET:", err);

  res.status(500).json({
    success: false,
    message: "An internal server error occurred",
  });
}