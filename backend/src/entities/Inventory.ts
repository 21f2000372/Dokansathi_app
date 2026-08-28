import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
} from "typeorm";

import { Product } from "./Product";

@Entity("inventories")
export class Inventory {
  @PrimaryColumn({ type: "varchar", length: 50 })
  inventoryId!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  shopOwnerId!: string | null;

  @OneToMany(() => Product, (product) => product.inventory)
  products!: Product[];
}