import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";

import { Order } from "./Order";
import { Payment } from "./Payment";

@Entity("bills")
export class Bill {
  @PrimaryColumn({ type: "varchar", length: 50 })
  billId!: string;

  @OneToOne(() => Order, (order) => order.bill, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  order!: Order;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @CreateDateColumn()
  generatedAt!: Date;

  @OneToOne(() => Payment, (payment) => payment.bill)
  payment!: Payment;
}