import { Router } from "express";

import {
  createCustomerOrder,
  getMyOrders,
  getOwnerOrders,
  getMyOrder,
  getOwnerOrder,
  changeOrderStatus,
  cancelShopOrder,
  cancelMyOrder,
  getOwnerAnalytics,
  updateMyOrder,
} from "../controllers/orderController";

import { authenticate } from "../middlewares/authMiddleware";

import { authorizeRoles } from "../middlewares/roleMiddleware";

import { UserRole } from "../entities/User";

const router = Router();


// ==========================================
// CUSTOMER ROUTES
// ==========================================

// Create order
router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.CUSTOMER),
  createCustomerOrder
);


// Get customer's own orders
router.get(
  "/my",
  authenticate,
  authorizeRoles(UserRole.CUSTOMER),
  getMyOrders
);


// Get customer's single order
router.get(
  "/my/:orderId",
  authenticate,
  authorizeRoles(UserRole.CUSTOMER),
  getMyOrder
);


// Update customer's own pending order (quantities)
router.patch(
  "/my/:orderId",
  authenticate,
  authorizeRoles(UserRole.CUSTOMER),
  updateMyOrder
);


// Cancel customer's own pending order
router.patch(
  "/my/:orderId/cancel",
  authenticate,
  authorizeRoles(UserRole.CUSTOMER),
  cancelMyOrder
);


// ==========================================
// SHOP OWNER ROUTES
// ==========================================

// Get shop sales analytics (declared before
// "/shop/:orderId" so it isn't captured as an id).
router.get(
  "/analytics",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getOwnerAnalytics
);


// Get shop orders
router.get(
  "/shop",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getOwnerOrders
);


// Get single shop order
router.get(
  "/shop/:orderId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getOwnerOrder
);


// Update order status
router.patch(
  "/shop/:orderId/status",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  changeOrderStatus
);


// Cancel order
router.patch(
  "/shop/:orderId/cancel",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  cancelShopOrder
);

export default router;