
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
  shopOwnerId: string;
}


// ==========================================
// CREATE USER
// ==========================================

const createUser = async (
  data: CreateUserData,
  role: UserRole
) => {
  const {
    name,
    phone,
    email,
    password,
    shopOwnerId,
  } = data;

  const existingUser = await userRepository.findOne({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error(
      "User with this email already exists"
    );
  }

  const passwordHash = await bcrypt.hash(
    password,
    10
  );

  const user = userRepository.create({
    userId: randomUUID(),
    name,
    phone,
    email,
    passwordHash,
    role,
    shopOwnerId,
  });

  const savedUser =
    await userRepository.save(user);

  return {
    userId: savedUser.userId,
    name: savedUser.name,
    phone: savedUser.phone,
    email: savedUser.email,
    role: savedUser.role,
    shopOwnerId: savedUser.shopOwnerId,
  };
};


// ==========================================
// CREATE ASSISTANT
// ==========================================

export const createAssistant = async (
  data: CreateUserData
) => {
  return createUser(
    data,
    UserRole.ASSISTANT
  );
};


// ==========================================
// CREATE CUSTOMER
// ==========================================

export const createCustomer = async (
  data: CreateUserData
) => {
  return createUser(
    data,
    UserRole.CUSTOMER
  );
};


// ==========================================
// GET ASSISTANTS
// ==========================================

export const getAssistants = async (
  shopOwnerId: string
) => {
  return userRepository.find({
    where: {
      role: UserRole.ASSISTANT,
      shopOwnerId,
    },
    select: {
      userId: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      availabilityStatus: true,
    },
  });
};


// ==========================================
// GET CUSTOMERS
// ==========================================

export const getCustomers = async (
  shopOwnerId: string
) => {
  return userRepository.find({
    where: {
      role: UserRole.CUSTOMER,
      shopOwnerId,
    },
    select: {
      userId: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      availabilityStatus: true,
    },
  });
};


// ==========================================
// UPDATE ASSISTANT
// ==========================================

export const updateAssistant = async (
  userId: string,
  shopOwnerId: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
  }
) => {

  const assistant =
    await userRepository.findOne({
      where: {
        userId,
        role: UserRole.ASSISTANT,
        shopOwnerId,
      },
    });

  if (!assistant) {
    throw new Error("Assistant not found");
  }


  // Check email belongs to another user
  if (
    data.email &&
    data.email !== assistant.email
  ) {
    const existingUser =
      await userRepository.findOne({
        where: {
          email: data.email,
        },
      });

    if (existingUser) {
      throw new Error(
        "User with this email already exists"
      );
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
    assistant.passwordHash =
      await bcrypt.hash(
        data.password,
        10
      );
  }


  const updatedAssistant =
    await userRepository.save(
      assistant
    );

  return {
    userId: updatedAssistant.userId,
    name: updatedAssistant.name,
    phone: updatedAssistant.phone,
    email: updatedAssistant.email,
    role: updatedAssistant.role,
    shopOwnerId:
      updatedAssistant.shopOwnerId,
    availabilityStatus:
      updatedAssistant.availabilityStatus,
  };
};


// ==========================================
// UPDATE CUSTOMER
// ==========================================

export const updateCustomer = async (
  userId: string,
  shopOwnerId: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
  }
) => {

  const customer =
    await userRepository.findOne({
      where: {
        userId,
        role: UserRole.CUSTOMER,
        shopOwnerId,
      },
    });

  if (!customer) {
    throw new Error("Customer not found");
  }


  // Check email belongs to another user
  if (
    data.email &&
    data.email !== customer.email
  ) {
    const existingUser =
      await userRepository.findOne({
        where: {
          email: data.email,
        },
      });

    if (existingUser) {
      throw new Error(
        "User with this email already exists"
      );
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
    customer.passwordHash =
      await bcrypt.hash(
        data.password,
        10
      );
  }


  const updatedCustomer =
    await userRepository.save(
      customer
    );

  return {
    userId: updatedCustomer.userId,
    name: updatedCustomer.name,
    phone: updatedCustomer.phone,
    email: updatedCustomer.email,
    role: updatedCustomer.role,
    shopOwnerId:
      updatedCustomer.shopOwnerId,
    loyaltyPoints:
      updatedCustomer.loyaltyPoints,
    availabilityStatus:
      updatedCustomer.availabilityStatus,
  };
};


// ==========================================
// DEACTIVATE ASSISTANT
// ==========================================

export const deactivateAssistant = async (
  userId: string,
  shopOwnerId: string
) => {

  const assistant =
    await userRepository.findOne({
      where: {
        userId,
        role: UserRole.ASSISTANT,
        shopOwnerId,
      },
    });

  if (!assistant) {
    throw new Error("Assistant not found");
  }


  assistant.availabilityStatus =
    "inactive";

  await userRepository.save(
    assistant
  );

  return {
    userId: assistant.userId,
    name: assistant.name,
    availabilityStatus:
      assistant.availabilityStatus,
  };
};


// ==========================================
// DEACTIVATE CUSTOMER
// ==========================================

export const deactivateCustomer = async (
  userId: string,
  shopOwnerId: string
) => {

  const customer =
    await userRepository.findOne({
      where: {
        userId,
        role: UserRole.CUSTOMER,
        shopOwnerId,
      },
    });

  if (!customer) {
    throw new Error("Customer not found");
  }


  customer.availabilityStatus =
    "inactive";

  await userRepository.save(
    customer
  );

  return {
    userId: customer.userId,
    name: customer.name,
    availabilityStatus:
      customer.availabilityStatus,
  };
};


// ==========================================
// REACTIVATE ASSISTANT
// ==========================================

export const reactivateAssistant = async (
  userId: string,
  shopOwnerId: string
) => {

  const assistant =
    await userRepository.findOne({
      where: {
        userId,
        role: UserRole.ASSISTANT,
        shopOwnerId,
      },
    });

  if (!assistant) {
    throw new Error("Assistant not found");
  }


  assistant.availabilityStatus =
    "active";

  await userRepository.save(
    assistant
  );

  return {
    userId: assistant.userId,
    name: assistant.name,
    availabilityStatus:
      assistant.availabilityStatus,
  };
};


// ==========================================
// REACTIVATE CUSTOMER
// ==========================================

export const reactivateCustomer = async (
  userId: string,
  shopOwnerId: string
) => {

  const customer =
    await userRepository.findOne({
      where: {
        userId,
        role: UserRole.CUSTOMER,
        shopOwnerId,
      },
    });

  if (!customer) {
    throw new Error("Customer not found");
  }


  customer.availabilityStatus =
    "active";

  await userRepository.save(
    customer
  );

  return {
    userId: customer.userId,
    name: customer.name,
    availabilityStatus:
      customer.availabilityStatus,
  };
};


// ==========================================
// PERMANENTLY DELETE ASSISTANT
// ==========================================

export const permanentlyDeleteAssistant =
  async (
    userId: string,
    shopOwnerId: string
  ) => {

    const assistant =
      await userRepository.findOne({
        where: {
          userId,
          role: UserRole.ASSISTANT,
          shopOwnerId,
        },
      });

    if (!assistant) {
      throw new Error(
        "Assistant not found"
      );
    }


    if (
      assistant.availabilityStatus !==
      "inactive"
    ) {
      throw new Error(
        "Assistant must be deactivated before it can be permanently deleted"
      );
    }


    // TODO:
    // Check linked records before deletion.
    //
    // Example:
    //
    // const hasOrders =
    //   await orderRepository.count({
    //     where: {
    //       assistantId: userId
    //     }
    //   });
    //
    // if (hasOrders > 0) {
    //   throw new Error(
    //     "Cannot delete assistant with existing order history"
    //   );
    // }


    await userRepository.remove(
      assistant
    );

    return {
      userId,
    };
  };


// ==========================================
// PERMANENTLY DELETE CUSTOMER
// ==========================================

export const permanentlyDeleteCustomer =
  async (
    userId: string,
    shopOwnerId: string
  ) => {

    const customer =
      await userRepository.findOne({
        where: {
          userId,
          role: UserRole.CUSTOMER,
          shopOwnerId,
        },
      });

    if (!customer) {
      throw new Error(
        "Customer not found"
      );
    }


    if (
      customer.availabilityStatus !==
      "inactive"
    ) {
      throw new Error(
        "Customer must be deactivated before it can be permanently deleted"
      );
    }


    // TODO:
    // Check linked records before deletion.


    await userRepository.remove(
      customer
    );

    return {
      userId,
    };
  };

