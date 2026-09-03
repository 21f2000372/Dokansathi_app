import { Router } from "express";

import { getMyNotifications } from "../controllers/notificationController";

import { authenticate } from "../middlewares/authMiddleware";

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


export default router;
