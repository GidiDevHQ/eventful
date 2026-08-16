import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as analyticsController from "./analyticsController";

const router = Router();

/**
 * @openapi
 * /api/v1/analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Get overall stats across all events created by the logged-in creator
 */
router.get(
  "/overview",
  requireAuth,
  requireRole("CREATOR"),
  analyticsController.getCreatorOverview
);

/**
 * @openapi
 * /api/v1/analytics/events/{id}:
 *   get:
 *     tags: [Analytics]
 *     summary: Get detailed analytics for a specific event (creator only, must own event)
 */
router.get(
  "/events/:id",
  requireAuth,
  requireRole("CREATOR"),
  analyticsController.getEventAnalytics
);

export default router;