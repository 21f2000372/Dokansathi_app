import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
  getUserNotifications,
  sendLowStockReminder,
} from "../services/notificationService";


// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

export const getMyNotifications = async (
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

    const notifications =
      await getUserNotifications(
        req.user.userId
      );

    res.status(200).json({
      notifications,
    });

  } catch (error) {

    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch notifications",
    });
  }
};


// ==========================================
// ASSISTANT - SEND LOW-STOCK REMINDER
// ==========================================

export const sendRestockReminder = async (
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
      await sendLowStockReminder(
        req.user.userId,
        productId
      );

    res.status(200).json({
      message:
        "Reminder sent to owner",
      ...result,
    });

  } catch (error) {

    console.error(
      "Send restock reminder error:",
      error
    );

    const detail =
      error instanceof Error
        ? error.message
        : "Failed to send reminder";

    // Known client-fixable cases get 400,
    // everything else is a server error.
    const knownClientErrors = [
      "Assistant not found",
      "Assistant is not associated with a shop",
      "Product not found",
      "Cannot send reminder yet: the shop has no orders to attach the alert to",
    ];

    const status =
      knownClientErrors.includes(detail)
        ? 400
        : 500;

    res.status(status).json({
      message: detail,
    });
  }
};
