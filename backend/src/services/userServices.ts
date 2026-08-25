import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);

interface CreateUserData {
  name: string;
  phone: string;
  email: string;
  password: string;
}

const createUser = async (
  data: CreateUserData,
  role: UserRole
) => {
  const { name, phone, email, password } = data;

  const existingUser = await userRepository.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = userRepository.create({
    userId: randomUUID(),
    name,
    phone,
    email,
    passwordHash,
    role,
  });

  const savedUser = await userRepository.save(user);

  return {
    userId: savedUser.userId,
    name: savedUser.name,
    phone: savedUser.phone,
    email: savedUser.email,
    role: savedUser.role,
  };
};

export const createAssistant = async (
  data: CreateUserData
) => {
  return createUser(data, UserRole.ASSISTANT);
};

export const createCustomer = async (
  data: CreateUserData
) => {
  return createUser(data, UserRole.CUSTOMER);
};

export const getAssistants = async () => {
  return userRepository.find({
    where: {
      role: UserRole.ASSISTANT,
    },
    select: {
      userId: true,
      name: true,
      phone: true,
      email: true,
      role: true,
    },
  });
};

export const getCustomers = async () => {
  return userRepository.find({
    where: {
      role: UserRole.CUSTOMER,
    },
    select: {
      userId: true,
      name: true,
      phone: true,
      email: true,
      role: true,
    },
  });
};

export const updateAssistant = async (
  userId: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
  }
) => {
  const assistant = await userRepository.findOne({
    where: {
      userId,
      role: UserRole.ASSISTANT,
    },
  });

  if (!assistant) {
    throw new Error("Assistant not found");
  }

  if (data.email && data.email !== assistant.email) {
    const existingUser = await userRepository.findOne({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }
  }

  if (data.name !== undefined) {
    assistant.name = data.name;
  }

  if (data.phone !== undefined) {
    assistant.phone = data.phone;
  }

  if (data.email !== undefined) {
    assistant.email = data.email;
  }

  if (data.password) {
    assistant.passwordHash = await bcrypt.hash(
      data.password,
      10
    );
  }

  const updatedAssistant =
    await userRepository.save(assistant);

  return {
    userId: updatedAssistant.userId,
    name: updatedAssistant.name,
    phone: updatedAssistant.phone,
    email: updatedAssistant.email,
    role: updatedAssistant.role,
    availabilityStatus:
      updatedAssistant.availabilityStatus,
  };
};

export const updateCustomer = async (
  userId: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
  }
) => {
  const customer = await userRepository.findOne({
    where: {
      userId,
      role: UserRole.CUSTOMER,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (data.email && data.email !== customer.email) {
    const existingUser = await userRepository.findOne({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }
  }

  if (data.name !== undefined) {
    customer.name = data.name;
  }

  if (data.phone !== undefined) {
    customer.phone = data.phone;
  }

  if (data.email !== undefined) {
    customer.email = data.email;
  }

  if (data.password) {
    customer.passwordHash = await bcrypt.hash(
      data.password,
      10
    );
  }

  const updatedCustomer =
    await userRepository.save(customer);

  return {
    userId: updatedCustomer.userId,
    name: updatedCustomer.name,
    phone: updatedCustomer.phone,
    email: updatedCustomer.email,
    role: updatedCustomer.role,
    loyaltyPoints: updatedCustomer.loyaltyPoints,
  };
};

// deactivation function

export const deactivateAssistant = async (
  userId: string
) => {
  const assistant = await userRepository.findOne({
    where: {
      userId,
      role: UserRole.ASSISTANT,
    },
  });

  if (!assistant) {
    throw new Error("Assistant not found");
  }

  assistant.availabilityStatus = "inactive";

  await userRepository.save(assistant);

  return {
    userId: assistant.userId,
    name: assistant.name,
    availabilityStatus: assistant.availabilityStatus,
  };
};

export const deactivateCustomer = async (
  userId: string
) => {
  const customer = await userRepository.findOne({
    where: {
      userId,
      role: UserRole.CUSTOMER,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  customer.availabilityStatus = "inactive";

  await userRepository.save(customer);

  return {
    userId: customer.userId,
    name: customer.name,
    availabilityStatus: customer.availabilityStatus,
  };
};