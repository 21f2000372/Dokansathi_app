import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
} from "../services/authService";

import { AuthRequest } from "../middlewares/authMiddleware";

export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  res.status(200).json({
    user: req.user,
  });
};

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }

    const user = await registerUser({
      name,
      phone,
      email,
      password,
    });

    res.status(201).json({
      message: "Shop created successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "User with this email already exists"
    ) {
      res.status(409).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: "Registration failed",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const result = await loginUser({
      email,
      password,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(401).json({
      message: "Invalid email or password",
    });
  }
};