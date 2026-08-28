import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";

import { OrderItem } from "./OrderItem";
import { Inventory } from "./Inventory";

@Entity("products")
export class Product {
  @PrimaryColumn({ type: "varchar", length: 50 })
  productId!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 100 })
  category!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "int", default: 0 })
  stockQuantity!: number;

  @Column({ type: "varchar", length: 30 })
  unit!: string;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
  })
  shopOwnerId!: string | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];
  @ManyToOne(() => Inventory, (inventory) => inventory.products)
  inventory!: Inventory;
}