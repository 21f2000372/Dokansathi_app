import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";

import { getShopAnalytics } from "../services/orderService";

import { generateShopInsights } from "../services/aiService";


// ==========================================
// SHOP OWNER - GENERATE AI INSIGHTS
//
// Computes the owner's sales analytics on the
// server (from existing data) and asks Groq for
// a short plain-language analysis. Analytics are
// recomputed here so the client can't tamper with
// the numbers sent to the AI.
// ==========================================

export const getShopInsights = async (
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

    const analytics =
      await getShopAnalytics(
        req.user.userId
      );

    const insights =
      await generateShopInsights(
        analytics
      );

    res.status(200).json({
      insights,
    });

  } catch (error) {

    console.error(
      "AI insights error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate insights";

    // "AI is not configured" is a client-fixable
    // setup issue; other failures are treated as
    // upstream/server errors.
    const status =
      message === "AI is not configured"
        ? 503
        : 502;

    res.status(status).json({
      message,
    });
  }
};
