import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import { getUserNotifications } from "../services/notificationService";


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
