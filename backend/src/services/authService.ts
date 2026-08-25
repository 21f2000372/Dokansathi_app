import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);

interface RegisterData {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterData) => {
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
    role: UserRole.SHOP_OWNER,
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

export const loginUser = async (data: LoginData) => {
  const { email, password } = data;

  const user = await userRepository.findOne({
    where: { email },
  });

  console.log("Login email:", email);
  console.log("User found:", !!user);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  console.log("Password matches:", passwordMatches);

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    {
      userId: user.userId,
      role: user.role,
    },
    secret,
    {
      expiresIn: "1d",
    }
  );

  return {
    token,
    user: {
      userId: user.userId,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
  };
};