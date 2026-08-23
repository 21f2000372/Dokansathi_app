import {
  Entity,
  PrimaryColumn,
  OneToMany,
} from "typeorm";

import { Product } from "./Product";

@Entity("inventories")
export class Inventory {
  @PrimaryColumn({ type: "varchar", length: 50 })
  inventoryId!: string;

  @OneToMany(() => Product, (product) => product.inventory)
  products!: Product[];
}