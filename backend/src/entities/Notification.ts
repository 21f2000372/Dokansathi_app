import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";

import { Order } from "./Order";
import { User } from "./User";

@Entity("notifications")
export class Notification {
  @PrimaryColumn({ type: "varchar", length: 50 })
  notificationId!: string;

  @ManyToOne(() => Order, (order) => order.notifications, {
    nullable: false,
    onDelete: "CASCADE",
  })
  order!: Order;

  @ManyToOne(() => User, (user) => user.notifications, {
    nullable: false,
  })
  recipient!: User;

  @Column({ type: "text" })
  message!: string;

  @CreateDateColumn()
  sentAt!: Date;
}