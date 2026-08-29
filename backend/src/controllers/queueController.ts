import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
  addOrderToQueue,
  getShopQueue,
  getQueueOrder,
  updateQueuePosition,
  removeOrderFromQueue,
} from "../services/queueService";


// ==========================================
// ADD ORDER TO QUEUE
// ==========================================

export const addToQueue = async (
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

    const orderId =
      String(req.params.orderId);

    const order =
      await addOrderToQueue(
        orderId,
        req.user.userId
      );

    res.status(200).json({
      message:
        "Order added to queue successfully",
      order: {
        orderId: order.orderId,
        status: order.status,
        queuePosition:
          order.queuePosition,
      },
    });
  } catch (error) {
    console.error(
      "Add to queue error:",
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
        "Failed to add order to queue",
    });
  }
};


// ==========================================
// GET SHOP QUEUE
// ==========================================

export const getQueue = async (
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

    const orders =
      await getShopQueue(
        req.user.userId
      );

    res.status(200).json({
      queue: orders,
    });
  } catch (error) {
    console.error(
      "Get queue error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch queue",
    });
  }
};


// ==========================================
// GET ONE QUEUE ORDER
// ==========================================

export const getOneQueueOrder = async (
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

    const orderId =
      String(req.params.orderId);

    const order =
      await getQueueOrder(
        orderId,
        req.user.userId
      );

    res.status(200).json({
      order,
    });
  } catch (error) {
    console.error(
      "Get queue order error:",
      error
    );

    if (error instanceof Error) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message:
        "Failed to fetch queue order",
    });
  }
};


// ==========================================
// UPDATE POSITION
// ==========================================

export const changeQueuePosition =
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

      const orderId =
        String(req.params.orderId);

      const {
        position,
      } = req.body;

      const newPosition =
        Number(position);

      if (
        !Number.isInteger(
          newPosition
        ) ||
        newPosition < 1
      ) {
        res.status(400).json({
          message:
            "Position must be a positive integer",
        });
        return;
      }

      const order =
        await updateQueuePosition(
          orderId,
          req.user.userId,
          newPosition
        );

      res.status(200).json({
        message:
          "Queue position updated successfully",
        order: {
          orderId:
            order?.orderId,
          queuePosition:
            order?.queuePosition,
        },
      });
    } catch (error) {
      console.error(
        "Update queue position error:",
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
          "Failed to update queue position",
      });
    }
  };


// ==========================================
// REMOVE FROM QUEUE
// ==========================================

export const removeFromQueue =
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

      const orderId =
        String(req.params.orderId);

      const result =
        await removeOrderFromQueue(
          orderId,
          req.user.userId
        );

      res.status(200).json({
        message:
          "Order removed from queue",
        order: result,
      });
    } catch (error) {
      console.error(
        "Remove from queue error:",
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
          "Failed to remove order from queue",
      });
    }
  };