import { randomUUID } from "crypto";

import { AppDataSource } from "../config/data-source";

import { Notification } from "../entities/Notification";
import { Order } from "../entities/Order";
import { User } from "../entities/User";

const notificationRepository =
  AppDataSource.getRepository(Notification);

const orderRepository =
  AppDataSource.getRepository(Order);

const userRepository =
  AppDataSource.getRepository(User);


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
  message: string
) => {

  const recipient =
    await userRepository.findOne({
      where: {
        userId: recipientId,
      },
    });

  if (!recipient) {
    throw new Error(
      "Notification recipient not found"
    );
  }

  const order =
    await orderRepository.findOne({
      where: {
        orderId,
      },
    });

  if (!order) {
    throw new Error(
      "Notification order not found"
    );
  }

  const notification =
    notificationRepository.create({
      notificationId: randomUUID(),
      recipient,
      order,
      message,
    });

  return await notificationRepository.save(
    notification
  );
};


// ==========================================
// GET USER NOTIFICATIONS
//
// Returns the notifications addressed to a
// specific user, newest first.
// ==========================================

export const getUserNotifications = async (
  userId: string
) => {

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
