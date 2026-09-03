import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
  createPayment,
  getShopPayments,
  getPaymentById,
  updatePaymentStatus,
} from "../services/paymentService";

import {
  PaymentMethod,
  PaymentStatus,
} from "../entities/Payment";


// ==========================================
// CREATE PAYMENT
// ==========================================

export const addPayment = async (
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

    const {
      billId,
      method,
    } = req.body;

    if (!billId || !method) {
      res.status(400).json({
        message:
          "billId and method are required",
      });
      return;
    }

    if (
      !Object.values(
        PaymentMethod
      ).includes(method)
    ) {
      res.status(400).json({
        message:
          "Invalid payment method",
      });
      return;
    }

    const result =
      await createPayment(
        billId,
        req.user.userId,
        method
      );

    res.status(201).json({
      message:
        "Payment created successfully",

      billId:
        result.billId,

      orderId:
        result.orderId,

      payment: {
        paymentId:
          result.paymentId,

        amount:
          result.amount,

        method:
          result.method,

        status:
          result.status,
      },
    });
  } catch (error) {
    console.error(
      "Create payment error:",
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
        "Failed to create payment",
    });
  }
};


// ==========================================
// GET ALL PAYMENTS
// ==========================================

export const getPayments = async (
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

    const payments =
      await getShopPayments(
        req.user.userId
      );

    res.status(200).json({
      payments,
    });
  } catch (error) {
    console.error(
      "Get payments error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch payments",
    });
  }
};


// ==========================================
// GET ONE PAYMENT
// ==========================================

export const getPayment = async (
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

    const paymentId =
      String(req.params.paymentId);

    const payment =
      await getPaymentById(
        paymentId,
        req.user.userId
      );

    res.status(200).json({
      payment,
    });
  } catch (error) {
    console.error(
      "Get payment error:",
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
        "Failed to fetch payment",
    });
  }
};


// ==========================================
// UPDATE PAYMENT STATUS
// ==========================================

export const changePaymentStatus =
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

      const paymentId =
        String(req.params.paymentId);

      const { status } =
        req.body;

      if (
        !Object.values(
          PaymentStatus
        ).includes(status)
      ) {
        res.status(400).json({
          message:
            "Invalid payment status",
        });
        return;
      }

      const payment =
        await updatePaymentStatus(
          paymentId,
          req.user.userId,
          status
        );

      res.status(200).json({
        message:
          "Payment status updated successfully",

        payment: {
          paymentId:
            payment.paymentId,

          status:
            payment.status,
        },
      });
    } catch (error) {
      console.error(
        "Update payment status error:",
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
          "Failed to update payment status",
      });
    }
  };