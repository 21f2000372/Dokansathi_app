import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { User } from "../entities/User";
import { Product } from "../entities/Product";
import { Inventory } from "../entities/Inventory";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Task } from "../entities/Task";
import { Bill } from "../entities/Bill";
import { Payment } from "../entities/Payment";
import { Notification } from "../entities/Notification";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "dokansathi",

  entities: [
    User,
    Product,
    Inventory,
    Order,
    OrderItem,
    Task,
    Bill,
    Payment,
    Notification,
  ],

  migrations: ["src/migrations/*.ts"],

  synchronize: false,
  logging: false,
});