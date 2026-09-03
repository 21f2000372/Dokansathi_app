import { Router } from "express";

import {
  getMyNotifications,
  sendRestockReminder,
} from "../controllers/notificationController";

import { authenticate } from "../middlewares/authMiddleware";

import { authorizeRoles } from "../middlewares/roleMiddleware";

import { UserRole } from "../entities/User";

const router = Router();


// ==========================================
// NOTIFICATIONS (any authenticated user)
// ==========================================

// Get the current user's notifications
router.get(
  "/",
  authenticate,
  getMyNotifications
);


// ==========================================
// ASSISTANT: send low-stock reminder to owner
// ==========================================

router.post(
  "/reminder/:productId",
  authenticate,
  authorizeRoles(UserRole.ASSISTANT),
  sendRestockReminder
);


export default router;
