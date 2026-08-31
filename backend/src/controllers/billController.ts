import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
  createBill,
  getShopBills,
  getBillById,
  getBillByOrder,
} from "../services/billService";


// ==========================================
// CREATE BILL
// ==========================================

export const addBill = async (
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

    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({
        message:
          "orderId is required",
      });
      return;
    }

    const bill =
      await createBill(
        orderId,
        req.user.userId
      );

    res.status(201).json({
      message:
        "Bill generated successfully",
      bill: {
        billId: bill.billId,
        orderId: bill.order.orderId,
        amount: bill.amount,
        generatedAt:
          bill.generatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Create bill error:",
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
        "Failed to generate bill",
    });
  }
};


// ==========================================
// GET ALL SHOP BILLS
// ==========================================

export const getBills = async (
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

    const bills =
      await getShopBills(
        req.user.userId
      );

    res.status(200).json({
      bills,
    });
  } catch (error) {
    console.error(
      "Get bills error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch bills",
    });
  }
};


// ==========================================
// GET ONE BILL
// ==========================================

export const getBill = async (
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

    const billId =
      String(req.params.billId);

    const bill =
      await getBillById(
        billId,
        req.user.userId
      );

    res.status(200).json({
      bill,
    });
  } catch (error) {
    console.error(
      "Get bill error:",
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
        "Failed to fetch bill",
    });
  }
};


// ==========================================
// GET BILL BY ORDER
// ==========================================

export const getOrderBill = async (
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

    const bill =
      await getBillByOrder(
        orderId,
        req.user.userId
      );

    res.status(200).json({
      bill,
    });
  } catch (error) {
    console.error(
      "Get order bill error:",
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
        "Failed to fetch bill",
    });
  }
};