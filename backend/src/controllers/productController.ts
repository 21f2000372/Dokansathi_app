import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import { AppDataSource } from "../config/data-source";

import { User } from "../entities/User";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsForCustomer,
} from "../services/productService";

const userRepository =
  AppDataSource.getRepository(User);


// ==========================================
// ADD PRODUCT
// ==========================================

export const addProduct = async (
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

    const {
      name,
      category,
      price,
      stockQuantity,
      unit,
    } = req.body;

    if (
      !name ||
      !category ||
      price === undefined ||
      stockQuantity === undefined ||
      !unit
    ) {
      res.status(400).json({
        message:
          "Name, category, price, stock quantity and unit are required",
      });
      return;
    }

    if (Number(price) < 0) {
      res.status(400).json({
        message: "Price cannot be negative",
      });
      return;
    }

    if (Number(stockQuantity) < 0) {
      res.status(400).json({
        message:
          "Stock quantity cannot be negative",
      });
      return;
    }

    const product =
      await createProduct(
        {
          name,
          category,
          price: Number(price),
          stockQuantity: Number(stockQuantity),
          unit,
        },
        req.user.userId
      );

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    res.status(500).json({
      message: "Failed to create product",
    });
  }
};


// ==========================================
// GET ALL PRODUCTS
// ==========================================

export const getAllProducts = async (
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

    const products =
      await getProducts(
        req.user.userId
      );

    res.status(200).json({
      products,
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};


// ==========================================
// GET SINGLE PRODUCT
// ==========================================

export const getProduct = async (
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

    const productId = String(req.params.productId);

    const product =
      await getProductById(
        productId,
        req.user.userId
      );

    res.status(200).json({
      product,
    });
  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Product not found"
    ) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};


// ==========================================
// UPDATE PRODUCT
// ==========================================

export const editProduct = async (
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

    const productId = String(req.params.productId);

    const {
      name,
      category,
      price,
      stockQuantity,
      unit,
    } = req.body;

    if (
      price !== undefined &&
      Number(price) < 0
    ) {
      res.status(400).json({
        message: "Price cannot be negative",
      });
      return;
    }

    if (
      stockQuantity !== undefined &&
      Number(stockQuantity) < 0
    ) {
      res.status(400).json({
        message:
          "Stock quantity cannot be negative",
      });
      return;
    }

    const product =
      await updateProduct(
        productId,
        req.user.userId,
        {
          name,
          category,
          price:
            price !== undefined
              ? Number(price)
              : undefined,
          stockQuantity:
            stockQuantity !== undefined
              ? Number(stockQuantity)
              : undefined,
          unit,
        }
      );

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Product not found"
    ) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    res.status(500).json({
      message: "Failed to update product",
    });
  }
};


// ==========================================
// DELETE PRODUCT
// ==========================================

export const removeProduct = async (
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

    const productId = String(req.params.productId);

    const result =
      await deleteProduct(
        productId,
        req.user.userId
      );

    res.status(200).json({
      message: "Product deleted successfully",
      ...result,
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Product not found"
    ) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

// ==========================================
// GET PRODUCTS FOR ASSISTANT (READ-ONLY)
// ==========================================

export const getAssistantProducts = async (
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

    const assistant =
      await userRepository.findOne({
        where: {
          userId: req.user.userId,
        },
      });

    if (!assistant) {
      res.status(404).json({
        message: "Assistant not found",
      });
      return;
    }

    if (!assistant.shopOwnerId) {
      res.status(400).json({
        message:
          "Assistant is not associated with a shop",
      });
      return;
    }

    const products =
      await getProductsForCustomer(
        assistant.shopOwnerId
      );

    res.status(200).json({
      products,
    });

  } catch (error) {
    console.error(
      "Get assistant products error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch products",
    });
  }
};


// ==========================================
// GET PRODUCTS FOR CUSTOMER
// ==========================================

export const getCustomerProducts = async (
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

    const customer =
      await userRepository.findOne({
        where: {
          userId: req.user.userId,
        },
      });

    if (!customer) {
      res.status(404).json({
        message: "Customer not found",
      });
      return;
    }

    if (!customer.shopOwnerId) {
      res.status(400).json({
        message:
          "Customer is not associated with a shop",
      });
      return;
    }

    const products =
      await getProductsForCustomer(
        customer.shopOwnerId
      );

    res.status(200).json({
      products,
    });

  } catch (error) {
    console.error(
      "Get customer products error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch products",
    });
  }
};