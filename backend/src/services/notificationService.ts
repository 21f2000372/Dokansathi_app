import { randomUUID } from "crypto";

import { AppDataSource } from "../config/data-source";

import { Notification } from "../entities/Notification";
import { Order } from "../entities/Order";
import { User } from "../entities/User";
import { Product } from "../entities/Product";

const notificationRepository = AppDataSource.getRepository(Notification);

const orderRepository = AppDataSource.getRepository(Order);

const userRepository = AppDataSource.getRepository(User);

const productRepository = AppDataSource.getRepository(Product);

// ==========================================
// CREATE NOTIFICATION
//
// Creates a notification row for a recipient
// tied to an order. This is intentionally
// non-throwing at the call site: callers wrap
// it so that a notification failure never
// breaks the main action (placing an order,
// assigning a task, etc.).
// ==========================================

export const createNotification = async (
  recipientId: string,
  orderId: string,
  message: string,
) => {
  const recipient = await userRepository.findOne({
    where: {
      userId: recipientId,
    },
  });

  if (!recipient) {
    throw new Error("Notification recipient not found");
  }

  const order = await orderRepository.findOne({
    where: {
      orderId,
    },
  });

  if (!order) {
    throw new Error("Notification order not found");
  }

  const notification = notificationRepository.create({
    notificationId: randomUUID(),
    recipient,
    order,
    message,
  });

  return await notificationRepository.save(notification);
};

// ==========================================
// GET USER NOTIFICATIONS
//
// Returns the notifications addressed to a
// specific user, newest first.
// ==========================================

export const getUserNotifications = async (userId: string) => {
  return notificationRepository.find({
    where: {
      recipient: {
        userId,
      },
    },

    relations: {
      order: true,
    },

    select: {
      notificationId: true,
      message: true,
      sentAt: true,

      order: {
        orderId: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
    },

    order: {
      sentAt: "DESC",
    },
  });
};


// ==========================================
// SEND LOW-STOCK REMINDER (assistant -> owner)
//
// An assistant flags a specific product as low
// on stock so the shop owner gets a reminder to
// restock it. The reminder is delivered through
// the existing notifications system.
//
// NOTE (no schema change): notifications require
// an order, so the reminder is attached to one
// existing order from the shop purely to satisfy
// that constraint. The message text carries the
// real information. If the shop has no orders yet,
// the reminder cannot be sent.
// ==========================================

export const sendLowStockReminder = async (
  assistantId: string,
  productId: string,
) => {
  // Who is the assistant, and which shop do they
  // belong to?
  const assistant = await userRepository.findOne({
    where: {
      userId: assistantId,
    },
  });

  if (!assistant) {
    throw new Error("Assistant not found");
  }

  const shopOwnerId = assistant.shopOwnerId;

  if (!shopOwnerId) {
    throw new Error(
      "Assistant is not associated with a shop",
    );
  }

  // The product must belong to the same shop.
  const product = await productRepository.findOne({
    where: {
      productId,
      shopOwnerId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Find any existing order from this shop to
  // attach the notification to (required by the
  // notifications table).
  const anyOrder = await orderRepository.findOne({
    where: {
      shopOwnerId,
    },
    order: {
      createdAt: "DESC",
    },
  });

  if (!anyOrder) {
    throw new Error(
      "Cannot send reminder yet: the shop has no orders to attach the alert to",
    );
  }

  const message =
    `Low stock reminder from ${assistant.name}: ` +
    `${product.name} is running low (${product.stockQuantity} ${product.unit} left). ` +
    `Please check inventory and restock.`;

  await createNotification(
    shopOwnerId,
    anyOrder.orderId,
    message,
  );

  return {
    productId: product.productId,
    productName: product.name,
  };
};
