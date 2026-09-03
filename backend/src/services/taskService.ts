import { AppDataSource } from "../config/data-source";

import {
  Task,
  TaskStatus,
} from "../entities/Task";

import { User, UserRole } from "../entities/User";

import { Order } from "../entities/Order";

import { createNotification } from "./notificationService";

import { randomUUID } from "crypto";

const taskRepository =
  AppDataSource.getRepository(Task);

const userRepository =
  AppDataSource.getRepository(User);

const orderRepository =
  AppDataSource.getRepository(Order);


// ==========================================
// CREATE TASK
// ==========================================

export const createTask = async (
  shopOwnerId: string,
  orderId: string,
  assistantId: string
) => {

  // ----------------------------------------
  // Check order belongs to this shop
  // ----------------------------------------

  const order =
    await orderRepository.findOne({
      where: {
        orderId,
        shopOwnerId,
      },
    });

  if (!order) {
    throw new Error(
      "Order not found or does not belong to this shop"
    );
  }


  // ----------------------------------------
  // Check assistant
  // ----------------------------------------

  const assistant =
    await userRepository.findOne({
      where: {
        userId: assistantId,
        role: UserRole.ASSISTANT,
        shopOwnerId,
      },
    });

  if (!assistant) {
    throw new Error(
      "Assistant not found or does not belong to this shop"
    );
  }


  // ----------------------------------------
  // Check if order already has an active task
  // ----------------------------------------

  const existingTask =
    await taskRepository.findOne({
      where: {
        order: {
          orderId,
        },
      },
    });

  if (existingTask) {
    throw new Error(
      "A task already exists for this order"
    );
  }


  // ----------------------------------------
  // Create task
  // ----------------------------------------

  const task =
    taskRepository.create({
      taskId: randomUUID(),

      order,

      assistant,

      status: TaskStatus.ASSIGNED,

      assignedAt: new Date(),
    });

  const savedTask =
    await taskRepository.save(task);

  // Notify the assistant that a task was
  // assigned to them. Non-fatal.
  try {
    await createNotification(
      assistant.userId,
      order.orderId,
      `You have been assigned a new task for order #${order.orderId.slice(
        0,
        8
      )}.`
    );
  } catch (notifyError) {
    console.error(
      "Failed to create assistant notification:",
      notifyError
    );
  }

  return savedTask;
};


// ==========================================
// GET SHOP OWNER TASKS
// ==========================================

export const getShopTasks = async (
  shopOwnerId: string
) => {

  /*
   * Get tasks through their related order.
   *
   * The Order contains shopOwnerId,
   * so this prevents another shop's
   * tasks from being returned.
   */

  const tasks =
    await taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect(
        "task.order",
        "order"
      )
      .leftJoinAndSelect(
        "task.assistant",
        "assistant"
      )
      .where(
        "order.shopOwnerId = :shopOwnerId",
        { shopOwnerId }
      )
      .select([
        "task.taskId",
        "task.status",
        "task.assignedAt",

        "order.orderId",
        "order.status",
        "order.totalAmount",
        "order.createdAt",
        "order.queuePosition",
        "order.shopOwnerId",

        "assistant.userId",
        "assistant.name",
        "assistant.phone",
        "assistant.email",
        "assistant.role",
        "assistant.shopOwnerId",
        "assistant.availabilityStatus",
      ])
      .orderBy(
        "task.assignedAt",
        "DESC"
      )
      .getMany();

  return tasks;
};


// ==========================================
// GET ONE SHOP TASK
// ==========================================

export const getShopTaskById = async (
  taskId: string,
  shopOwnerId: string
) => {

  const task =
    await taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect(
        "task.order",
        "order"
      )
      .leftJoinAndSelect(
        "task.assistant",
        "assistant"
      )
      .where(
        "task.taskId = :taskId",
        { taskId }
      )
      .andWhere(
        "order.shopOwnerId = :shopOwnerId",
        { shopOwnerId }
      )
      .select([
        "task.taskId",
        "task.status",
        "task.assignedAt",

        "order.orderId",
        "order.status",
        "order.totalAmount",
        "order.createdAt",
        "order.queuePosition",
        "order.shopOwnerId",

        "assistant.userId",
        "assistant.name",
        "assistant.phone",
        "assistant.email",
        "assistant.role",
        "assistant.shopOwnerId",
        "assistant.availabilityStatus",
      ])
      .getOne();

  if (!task) {
    throw new Error(
      "Task not found"
    );
  }

  return task;
};


// ==========================================
// UPDATE TASK STATUS - SHOP OWNER
// ==========================================

export const updateTaskStatus = async (
  taskId: string,
  shopOwnerId: string,
  status: TaskStatus
) => {

  const task =
    await taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect(
        "task.order",
        "order"
      )
      .leftJoinAndSelect(
        "task.assistant",
        "assistant"
      )
      .where(
        "task.taskId = :taskId",
        { taskId }
      )
      .andWhere(
        "order.shopOwnerId = :shopOwnerId",
        { shopOwnerId }
      )
      .getOne();

  if (!task) {
    throw new Error(
      "Task not found"
    );
  }

  task.status = status;

  return await taskRepository.save(
    task
  );
};


// ==========================================
// GET ASSISTANT TASKS
// ==========================================

export const getAssistantTasks = async (
  assistantId: string
) => {

  return taskRepository.find({
    where: {
      assistant: {
        userId: assistantId,
      },
    },

    relations: {
      order: {
        items: {
          product: true,
        },
      },
    },

    select: {
      taskId: true,
      status: true,
      assignedAt: true,

      assistant: {
        userId: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        shopOwnerId: true,
        availabilityStatus: true,
      },

      order: {
        orderId: true,
        status: true,
        createdAt: true,
        totalAmount: true,
        queuePosition: true,
        shopOwnerId: true,

        items: {
          itemId: true,
          quantity: true,
          unitPrice: true,

          product: {
            productId: true,
            name: true,
            category: true,
            unit: true,
            price: true,
          },
        },
      },
    },

    order: {
      assignedAt: "DESC",
    },
  });
};


// ==========================================
// UPDATE TASK STATUS - ASSISTANT
// ==========================================

export const updateAssistantTaskStatus =
  async (
    taskId: string,
    assistantId: string,
    status: TaskStatus
  ) => {

    const task =
      await taskRepository.findOne({
        where: {
          taskId,
          assistant: {
            userId: assistantId,
          },
        },

        relations: {
          assistant: true,
          order: true,
        },
      });

    if (!task) {
      throw new Error(
        "Task not found"
      );
    }

    task.status = status;

    return await taskRepository.save(
      task
    );
  };


// ==========================================
// DELETE TASK
// ==========================================

export const deleteTask = async (
  taskId: string,
  shopOwnerId: string
) => {

  const task =
    await taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect(
        "task.order",
        "order"
      )
      .where(
        "task.taskId = :taskId",
        { taskId }
      )
      .andWhere(
        "order.shopOwnerId = :shopOwnerId",
        { shopOwnerId }
      )
      .getOne();

  if (!task) {
    throw new Error(
      "Task not found"
    );
  }

  await taskRepository.remove(
    task
  );

  return {
    taskId,
  };
};