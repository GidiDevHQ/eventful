import { Router } from "express";
import { validate } from "@/middleware/validate";
import { authLimiter } from "@/middleware/rateLimiter";
import { loginSchema, signupSchema, refreshSchema } from "./authSchema";
import *as authController from "./authController";

const router = Router();

// Authentication routes handle sign-up, sign-in, and token refresh for both creators and event attendees.
/**
 * @openapi
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user (CREATOR or EVENTEE)
 *     tags: [Authentication]
 */

router.post("/signup", authLimiter, validate(signupSchema), authController.signup);

router.post("/login", authLimiter, validate(loginSchema), authController.login);

router.post("/refresh", authLimiter, validate(refreshSchema), authController.refresh);

export default router;