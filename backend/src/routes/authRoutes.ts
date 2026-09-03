import { Router } from "express";
import {
  register,
  login,
  getMe,
} from "../controllers/authController";

import {
  authenticate,
  rejectIfAuthenticated,
} from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", rejectIfAuthenticated, register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

export default router;