import { Router } from "express";

import {
  createReview,
  getOrderReview,
  getOwnerReviews,
} from "../controllers/reviewController";

import { authenticate } from "../middlewares/authMiddleware";

import { authorizeRoles } from "../middlewares/roleMiddleware";

import { UserRole } from "../entities/User";

const router = Router();


// ==========================================
// SHOP OWNER: view all reviews for the shop
// (declared before "/:orderId" so it isn't
// captured as an order id).
// ==========================================

router.get(
  "/shop",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getOwnerReviews
);


// ==========================================
// CUSTOMER: submit/update a review for an order
// ==========================================

router.post(
  "/:orderId",
  authenticate,
  authorizeRoles(UserRole.CUSTOMER),
  createReview
);


// ==========================================
// CUSTOMER: get their review for an order
// ==========================================

router.get(
  "/:orderId",
  authenticate,
  authorizeRoles(UserRole.CUSTOMER),
  getOrderReview
);


export default router;
