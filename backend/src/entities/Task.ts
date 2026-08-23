import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
} from "typeorm";

import { Order } from "./Order";
import { User } from "./User";

export enum TaskStatus {
  ASSIGNED = "assigned",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
}

@Entity("tasks")
export class Task {
  @PrimaryColumn({ type: "varchar", length: 50 })
  taskId!: string;

  @ManyToOne(() => Order, (order) => order.tasks, {
    nullable: false,
    onDelete: "CASCADE",
  })
  order!: Order;

  @ManyToOne(() => User, (user) => user.tasks, {
    nullable: false,
  })
  assistant!: User;

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.ASSIGNED,
  })
  status!: TaskStatus;

  @Column({ type: "timestamp", nullable: true })
  assignedAt!: Date | null;
}