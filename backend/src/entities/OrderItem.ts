import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
} from "typeorm";

import { Order } from "./Order";
import { Product } from "./Product";

@Entity("order_items")
export class OrderItem {
  @PrimaryColumn({ type: "varchar", length: 50 })
  itemId!: string;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: "CASCADE",
  })
  order!: Order;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    nullable: false,
  })
  product!: Product;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  unitPrice!: number;
}