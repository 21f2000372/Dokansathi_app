import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  CreateDateColumn,
} from "typeorm";

import { User } from "./User";
import { OrderItem } from "./OrderItem";
import { Task } from "./Task";
import { Bill } from "./Bill";
import { Notification } from "./Notification";

export enum OrderStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  READY = "ready",
  BILLED = "billed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity("orders")
export class Order {
  @PrimaryColumn({ type: "varchar", length: 50 })
  orderId!: string;

  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
  })
  customer!: User;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ type: "int", nullable: true })
  queuePosition!: number | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items!: OrderItem[];

  @OneToMany(() => Task, (task) => task.order)
  tasks!: Task[];

  @OneToOne(() => Bill, (bill) => bill.order)
  bill!: Bill;

  @OneToMany(() => Notification, (notification) => notification.order)
  notifications!: Notification[];
}