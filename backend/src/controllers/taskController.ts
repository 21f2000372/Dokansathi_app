import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import {
  createTask,
  getShopTasks,
  getShopTaskById,
  updateTaskStatus,
  getAssistantTasks,
  updateAssistantTaskStatus,
  deleteTask,
} from "../services/taskService";

import { TaskStatus } from "../entities/Task";


// ==========================================
// CREATE TASK
// ==========================================

export const addTask = async (
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
      orderId,
      assistantId,
    } = req.body;

    if (!orderId || !assistantId) {
      res.status(400).json({
        message:
          "orderId and assistantId are required",
      });
      return;
    }

    const task =
      await createTask(
        req.user.userId,
        orderId,
        assistantId
      );

    res.status(201).json({
      message:
        "Task created successfully",
      task: {
        taskId: task.taskId,
        orderId: task.order.orderId,
        assistantId:
          task.assistant.userId,
        status: task.status,
        assignedAt:
          task.assignedAt,
      },
    });

  } catch (error) {

    console.error(
      "Create task error:",
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
        "Failed to create task",
    });
  }
};


// ==========================================
// GET SHOP TASKS
// ==========================================

export const getTasks = async (
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

    const tasks =
      await getShopTasks(
        req.user.userId
      );

    res.status(200).json({
      tasks,
    });

  } catch (error) {

    console.error(
      "Get tasks error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch tasks",
    });
  }
};


// ==========================================
// GET ONE TASK
// ==========================================

export const getTask = async (
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

    const taskId =
      String(req.params.taskId);

    const task =
      await getShopTaskById(
        taskId,
        req.user.userId
      );

    res.status(200).json({
      task,
    });

  } catch (error) {

    console.error(
      "Get task error:",
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
        "Failed to fetch task",
    });
  }
};


// ==========================================
// UPDATE TASK STATUS
// ==========================================

export const changeTaskStatus =
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

      const taskId =
        String(req.params.taskId);

      const {
        status,
      } = req.body;

      if (
        !Object.values(TaskStatus).includes(
          status
        )
      ) {
        res.status(400).json({
          message:
            "Invalid task status",
        });
        return;
      }

      const task =
        await updateTaskStatus(
          taskId,
          req.user.userId,
          status
        );

      res.status(200).json({
        message:
          "Task status updated successfully",
        task: {
          taskId:
            task.taskId,
          status:
            task.status,
        },
      });

    } catch (error) {

      console.error(
        "Update task status error:",
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
          "Failed to update task status",
      });
    }
  };


// ==========================================
// GET ASSISTANT TASKS
// ==========================================

export const getMyTasks = async (
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

    const tasks =
      await getAssistantTasks(
        req.user.userId
      );

    res.status(200).json({
      tasks,
    });

  } catch (error) {

    console.error(
      "Get assistant tasks error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch tasks",
    });
  }
};


// ==========================================
// ASSISTANT UPDATE TASK STATUS
// ==========================================

export const changeMyTaskStatus =
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

      const taskId =
        String(req.params.taskId);

      const {
        status,
      } = req.body;

      if (
        !Object.values(TaskStatus).includes(
          status
        )
      ) {
        res.status(400).json({
          message:
            "Invalid task status",
        });
        return;
      }

      const task =
        await updateAssistantTaskStatus(
          taskId,
          req.user.userId,
          status
        );

      res.status(200).json({
        message:
          "Task status updated successfully",
        task: {
          taskId:
            task.taskId,
          status:
            task.status,
        },
      });

    } catch (error) {

      console.error(
        "Assistant update task status error:",
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
          "Failed to update task",
      });
    }
  };


// ==========================================
// DELETE TASK
// ==========================================

export const removeTask = async (
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

    const taskId =
      String(req.params.taskId);

    const result =
      await deleteTask(
        taskId,
        req.user.userId
      );

    res.status(200).json({
      message:
        "Task deleted successfully",
      task: result,
    });

  } catch (error) {

    console.error(
      "Delete task error:",
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
        "Failed to delete task",
    });
  }
};