import { Router } from "express";

import {
  createShopInventory,
  getShopInventory,
  addInventoryProduct,
  updateStock,
} from "../controllers/inventoryController";

import { authenticate } from "../middlewares/authMiddleware";

import { authorizeRoles } from "../middlewares/roleMiddleware";

import { UserRole } from "../entities/User";

const router = Router();


// ==========================================
// INVENTORY
// ==========================================

// Create inventory
router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  createShopInventory
);


// Get owner's inventory
router.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getShopInventory
);


// Add product to inventory
router.post(
  "/products/:productId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  addInventoryProduct
);


// Update product stock
router.patch(
  "/products/:productId/stock",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  updateStock
);

export default router;