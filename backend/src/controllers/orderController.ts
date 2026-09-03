import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
  createOrder,
  getCustomerOrders,
  getShopOwnerOrders,
  getCustomerOrderById,
  getShopOwnerOrderById,
  updateOrderStatus,
  cancelOrder,
  cancelCustomerOrder,
  getShopAnalytics,
} from "../services/orderService";

import { OrderStatus } from "../entities/Order";


// ==========================================
// CUSTOMER - CREATE ORDER
// ==========================================

export const createCustomerOrder = async (
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

    const { items } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(400).json({
        message:
          "At least one product is required",
      });
      return;
    }

    const order =
      await createOrder(
        req.user.userId,
        items
      );

    res.status(201).json({
      message:
        "Order created successfully",
      order,
    });

  } catch (error) {

    console.error(
      "Create order error:",
      error
    );

    if (error instanceof Error) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message:
        "Failed to create order",
    });
  }
};


// ==========================================
// CUSTOMER - GET OWN ORDERS
// ==========================================

export const getMyOrders = async (
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

    const orders =
      await getCustomerOrders(
        req.user.userId
      );

    res.status(200).json({
      orders,
    });

  } catch (error) {

    console.error(
      "Get customer orders error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch orders",
    });
  }
};


// ==========================================
// SHOP OWNER - GET ORDERS
// ==========================================

export const getOwnerOrders = async (
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

    const orders =
      await getShopOwnerOrders(
        req.user.userId
      );

    res.status(200).json({
      orders,
    });

  } catch (error) {

    console.error(
      "Get owner orders error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch orders",
    });
  }
};


// ==========================================
// CUSTOMER - GET SINGLE ORDER
// ==========================================

export const getMyOrder = async (
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

    const orderId = String(
      req.params.orderId
    );

    const order =
      await getCustomerOrderById(
        orderId,
        req.user.userId
      );

    res.status(200).json({
      order,
    });

  } catch (error) {

    if (
      error instanceof Error &&
      error.message ===
        "Order not found"
    ) {
      res.status(404).json({
        message:
          "Order not found",
      });
      return;
    }

    res.status(500).json({
      message:
        "Failed to fetch order",
    });
  }
};


// ==========================================
// CUSTOMER - CANCEL OWN ORDER
// ==========================================

export const cancelMyOrder = async (
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

    const orderId = String(
      req.params.orderId
    );

    const result =
      await cancelCustomerOrder(
        orderId,
        req.user.userId
      );

    res.status(200).json({
      message:
        "Order cancelled successfully",
      order: result,
    });

  } catch (error) {

    console.error(
      "Cancel customer order error:",
      error
    );

    if (error instanceof Error) {

      if (
        error.message ===
        "Order not found"
      ) {
        res.status(404).json({
          message:
            "Order not found",
        });
        return;
      }

      res.status(400).json({
        message:
          error.message,
      });
      return;
    }

    res.status(500).json({
      message:
        "Failed to cancel order",
    });
  }
};


// ==========================================
// SHOP OWNER - GET SINGLE ORDER
// ==========================================

export const getOwnerOrder = async (
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

    const orderId = String(
      req.params.orderId
    );

    const order =
      await getShopOwnerOrderById(
        orderId,
        req.user.userId
      );

    res.status(200).json({
      order,
    });

  } catch (error) {

    if (
      error instanceof Error &&
      error.message ===
        "Order not found"
    ) {
      res.status(404).json({
        message:
          "Order not found",
      });
      return;
    }

    res.status(500).json({
      message:
        "Failed to fetch order",
    });
  }
};


// ==========================================
// SHOP OWNER - UPDATE STATUS
// ==========================================

export const changeOrderStatus = async (
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

    const orderId = String(
      req.params.orderId
    );

    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        message:
          "Order status is required",
      });
      return;
    }

    const result =
      await updateOrderStatus(
        orderId,
        req.user.userId,
        status as OrderStatus
      );

    res.status(200).json({
      message:
        "Order status updated successfully",
      order: result,
    });

  } catch (error) {

    console.error(
      "Update order status error:",
      error
    );

    if (error instanceof Error) {

      if (
        error.message ===
        "Order not found"
      ) {
        res.status(404).json({
          message:
            "Order not found",
        });
        return;
      }

      res.status(400).json({
        message:
          error.message,
      });
      return;
    }

    res.status(500).json({
      message:
        "Failed to update order status",
    });
  }
};


// ==========================================
// SHOP OWNER - CANCEL ORDER
// ==========================================

export const cancelShopOrder = async (
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

    const orderId = String(
      req.params.orderId
    );

    const result =
      await cancelOrder(
        orderId,
        req.user.userId
      );

    res.status(200).json({
      message:
        "Order cancelled successfully",
      order: result,
    });

  } catch (error) {

    console.error(
      "Cancel order error:",
      error
    );

    if (error instanceof Error) {

      if (
        error.message ===
        "Order not found"
      ) {
        res.status(404).json({
          message:
            "Order not found",
        });
        return;
      }

      res.status(400).json({
        message:
          error.message,
      });
      return;
    }

    res.status(500).json({
      message:
        "Failed to cancel order",
    });
  }
};


// ==========================================
// SHOP OWNER - GET ANALYTICS
// ==========================================

export const getOwnerAnalytics = async (
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

    const analytics =
      await getShopAnalytics(
        req.user.userId
      );

    res.status(200).json(analytics);

  } catch (error) {

    console.error(
      "Get analytics error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load analytics",
    });
  }
};
