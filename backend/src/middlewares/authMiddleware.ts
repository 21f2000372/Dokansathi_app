import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";



export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}



interface JwtPayload {
  userId: string;
  role: string;
}

/*
 * rejectIfAuthenticated
 *
 * Guards "public only" endpoints such as
 * registration. If the request carries a valid
 * auth token (i.e. the caller is already logged
 * in), the request is rejected. Anonymous
 * callers (no token, or an invalid/expired one)
 * are allowed through so new shops can still
 * sign up.
 */
export const rejectIfAuthenticated = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    // Cannot verify; treat as anonymous.
    next();
    return;
  }

  try {
    jwt.verify(token, secret);

    // Token is valid => caller is logged in.
    res.status(403).json({
      message:
        "You are already logged in. Log out to create a new shop.",
    });
    return;
  } catch {
    // Invalid/expired token => treat as anonymous.
    next();
  }
};

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Authentication token is required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        message: "Authentication token is required",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not configured");
      res.status(500).json({
        message: "Server configuration error",
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};