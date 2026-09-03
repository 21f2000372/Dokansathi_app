import { Router } from "express";

import {
  addProduct,
  getAllProducts,
  getProduct,
  editProduct,
  removeProduct,
  getCustomerProducts,
  getAssistantProducts,
} from "../controllers/productController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

import { UserRole } from "../entities/User";

const router = Router();


// ==========================================
// PRODUCTS
// ==========================================

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  addProduct
);

router.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getAllProducts
);

// CUSTOMER

router.get(
  "/shop",
  authenticate,
  authorizeRoles(UserRole.CUSTOMER),
  getCustomerProducts
);


// ASSISTANT (read-only shop products)

router.get(
  "/assistant",
  authenticate,
  authorizeRoles(UserRole.ASSISTANT),
  getAssistantProducts
);


router.get(
  "/:productId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getProduct
);

router.put(
  "/:productId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  editProduct
);

router.delete(
  "/:productId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  removeProduct
);

export default router;