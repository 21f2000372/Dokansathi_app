import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
  submitReview,
  getMyReview,
  getShopReviews,
} from "../services/reviewService";

import { User } from "../entities/User";

import { AppDataSource } from "../config/data-source";

const userRepository =
  AppDataSource.getRepository(User);


// ==========================================
// CUSTOMER - SUBMIT / UPDATE REVIEW
// ==========================================

export const createReview = async (
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

    const { rating, comment } = req.body;

    const review = await submitReview(
      req.user.userId,
      orderId,
      Number(rating),
      comment
    );

    res.status(200).json({
      message: "Review submitted",
      review,
    });

  } catch (error) {

    console.error(
      "Submit review error:",
      error
    );

    const detail =
      error instanceof Error
        ? error.message
        : "Failed to submit review";

    const knownClientErrors = [
      "Rating must be a whole number between 1 and 5",
      "Order not found",
      "You can only review completed orders",
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


// ==========================================
// CUSTOMER - GET MY REVIEW FOR AN ORDER
// ==========================================

export const getOrderReview = async (
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

    const review = getMyReview(
      req.user.userId,
      orderId
    );

    res.status(200).json({
      review,
    });

  } catch (error) {

    console.error(
      "Get review error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load review",
    });
  }
};


// ==========================================
// SHOP OWNER - GET ALL SHOP REVIEWS
// ==========================================

export const getOwnerReviews = async (
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

    // The owner's own userId is the shopOwnerId
    // their products/orders are scoped to.
    const owner = await userRepository.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!owner) {
      res.status(404).json({
        message: "Owner not found",
      });
      return;
    }

    const data = getShopReviews(
      req.user.userId
    );

    res.status(200).json(data);

  } catch (error) {

    console.error(
      "Get shop reviews error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load reviews",
    });
  }
};
