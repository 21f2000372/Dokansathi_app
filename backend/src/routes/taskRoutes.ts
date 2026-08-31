import { Router } from "express";

import {
  addTask,
  getTasks,
  getTask,
  changeTaskStatus,
  getMyTasks,
  changeMyTaskStatus,
  removeTask,
} from "../controllers/taskController";

import { authenticate } from "../middlewares/authMiddleware";

import { authorizeRoles } from "../middlewares/roleMiddleware";

import { UserRole } from "../entities/User";

const router = Router();





// ==========================================
// ASSISTANT
// ==========================================

// Get own tasks
router.get(
  "/my",
  authenticate,
  authorizeRoles(UserRole.ASSISTANT),
  getMyTasks
);


// Update own task status
router.patch(
  "/:taskId/my-status",
  authenticate,
  authorizeRoles(UserRole.ASSISTANT),
  changeMyTaskStatus
);



// ==========================================
// SHOP OWNER
// ==========================================

// Create task
router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  addTask
);


// Get shop tasks
router.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getTasks
);


// Get one task
router.get(
  "/:taskId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getTask
);


// Update task status
router.patch(
  "/:taskId/status",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  changeTaskStatus
);


// Delete task
router.delete(
  "/:taskId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  removeTask
);


export default router;