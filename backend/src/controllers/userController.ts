
import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";

import {
  createAssistant,
  createCustomer,
  getAssistants,
  getCustomers,
  updateAssistant,
  updateCustomer,
  deactivateAssistant,
  deactivateCustomer,
  reactivateAssistant,
  reactivateCustomer,
  permanentlyDeleteCustomer,
  permanentlyDeleteAssistant,
} from "../services/userServices";


// ==========================================
// CREATE ASSISTANT
// ==========================================

export const addAssistant = async (
  req: AuthRequest,
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

    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const assistant = await createAssistant({
      name,
      phone,
      email,
      password,
      shopOwnerId,
    });

    res.status(201).json({
      message: "Assistant created successfully",
      user: assistant,
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
      message: "Failed to create assistant",
    });
  }
};


// ==========================================
// CREATE CUSTOMER
// ==========================================

export const addCustomer = async (
  req: AuthRequest,
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

    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const customer = await createCustomer({
      name,
      phone,
      email,
      password,
      shopOwnerId,
    });

    res.status(201).json({
      message: "Customer created successfully",
      user: customer,
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
      message: "Failed to create customer",
    });
  }
};


// ==========================================
// GET ALL ASSISTANTS FOR CURRENT SHOP OWNER
// ==========================================

export const getAllAssistants = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const assistants = await getAssistants(shopOwnerId);

    res.status(200).json({
      assistants,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch assistants",
    });
  }
};


// ==========================================
// GET ALL CUSTOMERS FOR CURRENT SHOP OWNER
// ==========================================

export const getAllCustomers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const customers = await getCustomers(shopOwnerId);

    res.status(200).json({
      customers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch customers",
    });
  }
};


// ==========================================
// UPDATE ASSISTANT
// ==========================================

export const editAssistant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (typeof userId !== "string") {
      res.status(400).json({
        message: "Invalid user ID",
      });
      return;
    }

    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const assistant = await updateAssistant(
      userId,
      shopOwnerId,
      req.body
    );

    res.status(200).json({
      message: "Assistant updated successfully",
      user: assistant,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Assistant not found"
    ) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

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
      message: "Failed to update assistant",
    });
  }
};


// ==========================================
// UPDATE CUSTOMER
// ==========================================

export const editCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (typeof userId !== "string") {
      res.status(400).json({
        message: "Invalid user ID",
      });
      return;
    }

    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const customer = await updateCustomer(
      userId,
      shopOwnerId,
      req.body
    );

    res.status(200).json({
      message: "Customer updated successfully",
      user: customer,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Customer not found"
    ) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

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
      message: "Failed to update customer",
    });
  }
};


// ==========================================
// DEACTIVATE ASSISTANT
// ==========================================

export const removeAssistant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (typeof userId !== "string") {
      res.status(400).json({
        message: "Invalid user ID",
      });
      return;
    }

    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const assistant = await deactivateAssistant(
      userId,
      shopOwnerId
    );

    res.status(200).json({
      message: "Assistant deactivated successfully",
      user: assistant,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Assistant not found"
    ) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: "Failed to deactivate assistant",
    });
  }
};


// ==========================================
// DEACTIVATE CUSTOMER
// ==========================================

export const removeCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (typeof userId !== "string") {
      res.status(400).json({
        message: "Invalid user ID",
      });
      return;
    }

    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const customer = await deactivateCustomer(
      userId,
      shopOwnerId
    );

    res.status(200).json({
      message: "Customer deactivated successfully",
      user: customer,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Customer not found"
    ) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: "Failed to deactivate customer",
    });
  }
};


// ==========================================
// REACTIVATE ASSISTANT
// ==========================================

export const restoreAssistant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (typeof userId !== "string") {
      res.status(400).json({
        message: "Invalid user ID",
      });
      return;
    }

    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const assistant = await reactivateAssistant(
      userId,
      shopOwnerId
    );

    res.status(200).json({
      message: "Assistant reactivated successfully",
      user: assistant,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Assistant not found"
    ) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: "Failed to reactivate assistant",
    });
  }
};


// ==========================================
// REACTIVATE CUSTOMER
// ==========================================

export const restoreCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (typeof userId !== "string") {
      res.status(400).json({
        message: "Invalid user ID",
      });
      return;
    }

    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const customer = await reactivateCustomer(
      userId,
      shopOwnerId
    );

    res.status(200).json({
      message: "Customer reactivated successfully",
      user: customer,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Customer not found"
    ) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: "Failed to reactivate customer",
    });
  }
};


// ==========================================
// PERMANENTLY DELETE ASSISTANT
// ==========================================

export const purgeAssistant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (typeof userId !== "string") {
      res.status(400).json({
        message: "Invalid user ID",
      });
      return;
    }

    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const result = await permanentlyDeleteAssistant(
      userId,
      shopOwnerId
    );

    res.status(200).json({
      message: "Assistant permanently deleted",
      user: result,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Assistant not found"
    ) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message ===
        "Assistant must be deactivated before it can be permanently deleted"
    ) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: "Failed to delete assistant",
    });
  }
};


// ==========================================
// PERMANENTLY DELETE CUSTOMER
// ==========================================

export const purgeCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (typeof userId !== "string") {
      res.status(400).json({
        message: "Invalid user ID",
      });
      return;
    }

    const shopOwnerId = req.user?.userId;

    if (!shopOwnerId) {
      res.status(401).json({
        message: "Authenticated user not found",
      });
      return;
    }

    const result = await permanentlyDeleteCustomer(
      userId,
      shopOwnerId
    );

    res.status(200).json({
      message: "Customer permanently deleted",
      user: result,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Customer not found"
    ) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message ===
        "Customer must be deactivated before it can be permanently deleted"
    ) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: "Failed to delete customer",
    });
  }
};

