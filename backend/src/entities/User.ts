import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
} from "typeorm";

import { Order } from "./Order";
import { Task } from "./Task";
import { Notification } from "./Notification";

export enum UserRole {
  CUSTOMER = "customer",
  SHOP_OWNER = "shop_owner",
  ASSISTANT = "assistant",
}

@Entity("users")
export class User {
  @PrimaryColumn({ type: "varchar", length: 50 })
  userId!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 15 })
  phone!: string;

  @Column({ type: "varchar", length: 150, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({
    type: "enum",
    enum: UserRole,
  })
  role!: UserRole;

  @Column({ type: "int", default: 0 })
  loyaltyPoints!: number;

  @Column({ type: "varchar", length: 20, nullable: true })
  availabilityStatus!: string | null;

  @OneToMany(() => Order, (order) => order.customer)
  orders!: Order[];

  @OneToMany(() => Task, (task) => task.assistant)
  tasks!: Task[];

  @OneToMany(() => Notification, (notification) => notification.recipient)
  notifications!: Notification[];
}