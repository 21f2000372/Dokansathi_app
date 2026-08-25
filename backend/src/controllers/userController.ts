import { Request, Response } from "express";

import {
  createAssistant,
  createCustomer,
  getAssistants,
  getCustomers,
  updateAssistant,
  updateCustomer,
  deactivateAssistant,
  deactivateCustomer,
} from "../services/userServices";


// ==========================================
// CREATE ASSISTANT
// ==========================================

export const addAssistant = async (
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

    const assistant = await createAssistant({
      name,
      phone,
      email,
      password,
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

    const customer = await createCustomer({
      name,
      phone,
      email,
      password,
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
// GET ALL ASSISTANTS
// ==========================================

export const getAllAssistants = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const assistants = await getAssistants();

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
// GET ALL CUSTOMERS
// ==========================================

export const getAllCustomers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customers = await getCustomers();

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
  req: Request,
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

    const assistant = await updateAssistant(
      userId,
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
      error.message ===
        "User with this email already exists"
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
  req: Request,
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

    const customer = await updateCustomer(
      userId,
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
      error.message ===
        "User with this email already exists"
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
  req: Request,
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

    const assistant = await deactivateAssistant(userId);

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
  req: Request,
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

    const customer = await deactivateCustomer(userId);

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