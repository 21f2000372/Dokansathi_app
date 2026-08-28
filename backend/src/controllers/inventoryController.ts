import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
  createInventory,
  getInventory,
  addProductToInventory,
  updateProductStock,
} from "../services/inventoryService";


// ==========================================
// CREATE INVENTORY
// ==========================================

export const createShopInventory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const inventory =
      await createInventory(
        req.user.userId
      );

    res.status(201).json({
      message:
        "Inventory created successfully",
      inventory,
    });
  } catch (error) {
    console.error(
      "Create inventory error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create inventory",
    });
  }
};


// ==========================================
// GET INVENTORY
// ==========================================

export const getShopInventory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const inventory =
      await getInventory(
        req.user.userId
      );

    res.status(200).json({
      inventory,
    });
  } catch (error) {
    console.error(
      "Get inventory error:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "Inventory not found"
    ) {
      res.status(404).json({
        message:
          "Inventory not found",
      });
      return;
    }

    res.status(500).json({
      message:
        "Failed to fetch inventory",
    });
  }
};


// ==========================================
// ADD PRODUCT TO INVENTORY
// ==========================================

export const addInventoryProduct =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          message:
            "Authentication required",
        });
        return;
      }

      const productId = String(
        req.params.productId
      );

      const result =
        await addProductToInventory(
          productId,
          req.user.userId
        );

      res.status(200).json({
        message:
          "Product added to inventory",
        product: result,
      });
    } catch (error) {
      console.error(
        "Add inventory product error:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "Inventory not found"
      ) {
        res.status(404).json({
          message:
            "Inventory not found",
        });
        return;
      }

      if (
        error instanceof Error &&
        error.message ===
          "Product not found"
      ) {
        res.status(404).json({
          message:
            "Product not found",
        });
        return;
      }

      res.status(500).json({
        message:
          "Failed to add product to inventory",
      });
    }
  };


// ==========================================
// UPDATE STOCK
// ==========================================

export const updateStock =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          message:
            "Authentication required",
        });
        return;
      }

      const productId = String(
        req.params.productId
      );

      const {
        stockQuantity,
      } = req.body;

      if (
        stockQuantity === undefined
      ) {
        res.status(400).json({
          message:
            "Stock quantity is required",
        });
        return;
      }

      const quantity =
        Number(stockQuantity);

      if (
        !Number.isFinite(quantity) ||
        quantity < 0
      ) {
        res.status(400).json({
          message:
            "Stock quantity must be a valid non-negative number",
        });
        return;
      }

      const product =
        await updateProductStock(
          productId,
          req.user.userId,
          quantity
        );

      res.status(200).json({
        message:
          "Stock updated successfully",
        product,
      });
    } catch (error) {
      console.error(
        "Update stock error:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "Product not found"
      ) {
        res.status(404).json({
          message:
            "Product not found",
        });
        return;
      }

      res.status(500).json({
        message:
          "Failed to update stock",
      });
    }
  };