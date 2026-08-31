import { Router } from "express";

import {
  addBill,
  getBills,
  getBill,
  getOrderBill,
} from "../controllers/billController";

import { authenticate } from "../middlewares/authMiddleware";

import { authorizeRoles } from "../middlewares/roleMiddleware";

import { UserRole } from "../entities/User";

const router = Router();


// Generate bill
router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  addBill
);


// Get all shop bills
router.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getBills
);


// Get bill for an order
// IMPORTANT: keep this before /:billId
router.get(
  "/order/:orderId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getOrderBill
);


// Get one bill
router.get(
  "/:billId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getBill
);

export default router;