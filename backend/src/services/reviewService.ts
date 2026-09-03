import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

import { AppDataSource } from "../config/data-source";
import { Order, OrderStatus } from "../entities/Order";

const orderRepository =
  AppDataSource.getRepository(Order);

// ==========================================
// REVIEW STORAGE (JSON FILE)
//
// Reviews are stored in a JSON file at the
// backend project root. This is a lightweight,
// demo-grade store (no database table). Each
// review is tied to an order and the customer
// who placed it.
// ==========================================

const REVIEWS_FILE = path.join(
  process.cwd(),
  "reviews.json",
);

export interface Review {
  reviewId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  shopOwnerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

/*
 * Read all reviews from the JSON file. Returns
 * an empty list if the file does not exist yet
 * or cannot be parsed.
 */
const readReviews = (): Review[] => {
  try {
    if (!fs.existsSync(REVIEWS_FILE)) {
      return [];
    }

    const raw = fs.readFileSync(
      REVIEWS_FILE,
      "utf-8",
    );

    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(
      "Failed to read reviews file:",
      error,
    );
    return [];
  }
};

/*
 * Persist all reviews to the JSON file.
 */
const writeReviews = (reviews: Review[]): void => {
  fs.writeFileSync(
    REVIEWS_FILE,
    JSON.stringify(reviews, null, 2),
    "utf-8",
  );
};

// ==========================================
// SUBMIT / UPDATE A REVIEW (CUSTOMER)
//
// Only the customer who owns the order may
// review it, and only once the order is
// completed. Submitting again updates the
// existing review (one review per order).
// ==========================================

export const submitReview = async (
  customerId: string,
  orderId: string,
  rating: number,
  comment: string,
): Promise<Review> => {
  // Validate rating.
  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new Error(
      "Rating must be a whole number between 1 and 5",
    );
  }

  // The order must exist and belong to this
  // customer.
  const order = await orderRepository.findOne({
    where: {
      orderId,
      customer: {
        userId: customerId,
      },
    },
    relations: {
      customer: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== OrderStatus.COMPLETED) {
    throw new Error(
      "You can only review completed orders",
    );
  }

  const reviews = readReviews();

  const now = new Date().toISOString();

  const existingIndex = reviews.findIndex(
    (review) =>
      review.orderId === orderId &&
      review.customerId === customerId,
  );

  const cleanComment = String(comment || "")
    .trim()
    .slice(0, 500);

  if (existingIndex >= 0) {
    // Update the existing review.
    const existing = reviews[existingIndex];

    const updated: Review = {
      ...existing,
      rating,
      comment: cleanComment,
      updatedAt: now,
    };

    reviews[existingIndex] = updated;
    writeReviews(reviews);

    return updated;
  }

  const review: Review = {
    reviewId: randomUUID(),
    orderId,
    customerId,
    customerName: order.customer?.name || "Customer",
    shopOwnerId: order.shopOwnerId || "",
    rating,
    comment: cleanComment,
    createdAt: now,
    updatedAt: now,
  };

  reviews.push(review);
  writeReviews(reviews);

  return review;
};

// ==========================================
// GET A CUSTOMER'S REVIEW FOR AN ORDER
// ==========================================

export const getMyReview = (
  customerId: string,
  orderId: string,
): Review | null => {
  const reviews = readReviews();

  return (
    reviews.find(
      (review) =>
        review.orderId === orderId &&
        review.customerId === customerId,
    ) || null
  );
};

// ==========================================
// GET ALL REVIEWS FOR A SHOP (OWNER)
// ==========================================

export const getShopReviews = (
  shopOwnerId: string,
) => {
  const reviews = readReviews()
    .filter(
      (review) =>
        review.shopOwnerId === shopOwnerId,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : Number(
          (
            reviews.reduce(
              (sum, review) => sum + review.rating,
              0,
            ) / totalReviews
          ).toFixed(1),
        );

  return {
    averageRating,
    totalReviews,
    reviews,
  };
};
