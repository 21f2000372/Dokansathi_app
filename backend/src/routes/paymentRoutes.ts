import { Router } from "express";

import {
  addPayment,
  getPayments,
  getPayment,
  changePaymentStatus,
} from "../controllers/paymentController";

import {
  authenticate,
} from "../middlewares/authMiddleware";

import {
  authorizeRoles,
} from "../middlewares/roleMiddleware";

import {
  UserRole,
} from "../entities/User";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  addPayment
);

router.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getPayments
);

router.get(
  "/:paymentId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getPayment
);

router.patch(
  "/:paymentId/status",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  changePaymentStatus
);

export default router;