import { Router } from "express";

import { getShopInsights } from "../controllers/aiController";

import { authenticate } from "../middlewares/authMiddleware";

import { authorizeRoles } from "../middlewares/roleMiddleware";

import { UserRole } from "../entities/User";

const router = Router();


// ==========================================
// AI ROUTES (shop owner only)
// ==========================================

// Generate AI insights on the owner's shop
// sales performance.
router.post(
  "/insights",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getShopInsights
);


export default router;
