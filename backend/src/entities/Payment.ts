import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
} from "typeorm";

import { Bill } from "./Bill";

export enum PaymentMethod {
  CASH = "cash",
  UPI = "upi",
  CARD = "card",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity("payments")
export class Payment {
  @PrimaryColumn({ type: "varchar", length: 50 })
  paymentId!: string;

  @OneToOne(() => Bill, (bill) => bill.payment, {
    nullable: false,
  })
  bill!: Bill;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @Column({
    type: "enum",
    enum: PaymentMethod,
  })
  method!: PaymentMethod;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;
}