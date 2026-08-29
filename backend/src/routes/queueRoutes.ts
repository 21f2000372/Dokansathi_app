import { Router } from "express";

import {
  addToQueue,
  getQueue,
  getOneQueueOrder,
  changeQueuePosition,
  removeFromQueue,
} from "../controllers/queueController";

import { authenticate } from "../middlewares/authMiddleware";

import { authorizeRoles } from "../middlewares/roleMiddleware";

import { UserRole } from "../entities/User";

const router = Router();


// ==========================================
// SHOP OWNER QUEUE
// ==========================================

// Add order to queue
router.post(
  "/:orderId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  addToQueue
);


// Get complete queue
router.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getQueue
);


// Get one queue order
router.get(
  "/:orderId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getOneQueueOrder
);


// Update queue position
router.patch(
  "/:orderId/position",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  changeQueuePosition
);


// Remove order from queue
router.delete(
  "/:orderId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  removeFromQueue
);

export default router;