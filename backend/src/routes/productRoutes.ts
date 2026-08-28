import { Router } from "express";

import {
  addProduct,
  getAllProducts,
  getProduct,
  editProduct,
  removeProduct,
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