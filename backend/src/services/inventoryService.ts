import { randomUUID } from "crypto";

import { AppDataSource } from "../config/data-source";

import { Inventory } from "../entities/Inventory";
import { Product } from "../entities/Product";

const inventoryRepository =
  AppDataSource.getRepository(Inventory);

const productRepository =
  AppDataSource.getRepository(Product);


// ==========================================
// CREATE INVENTORY
// ==========================================

export const createInventory = async (
  shopOwnerId: string
) => {
  const existingInventory =
    await inventoryRepository.findOne({
      where: {
        shopOwnerId,
      },
    });

  if (existingInventory) {
    return existingInventory;
  }

  const inventory =
    inventoryRepository.create({
      inventoryId: randomUUID(),
      shopOwnerId,
    });

  return await inventoryRepository.save(
    inventory
  );
};


// ==========================================
// GET OWNER'S INVENTORY
// ==========================================

export const getInventory = async (
  shopOwnerId: string
) => {
  const inventory =
    await inventoryRepository.findOne({
      where: {
        shopOwnerId,
      },
      relations: {
        products: true,
      },
    });

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  return inventory;
};


// ==========================================
// ADD PRODUCT TO INVENTORY
// ==========================================

export const addProductToInventory = async (
  productId: string,
  shopOwnerId: string
) => {
  // Find owner's inventory
  const inventory =
    await inventoryRepository.findOne({
      where: {
        shopOwnerId,
      },
    });

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  // IMPORTANT:
  // Product must belong to the same shop owner
  const product =
    await productRepository.findOne({
      where: {
        productId,
        shopOwnerId,
      },
    });

  if (!product) {
    throw new Error("Product not found");
  }

  product.inventory = inventory;

  const updatedProduct =
    await productRepository.save(product);

  return {
    productId: updatedProduct.productId,
    name: updatedProduct.name,
    category: updatedProduct.category,
    price: updatedProduct.price,
    stockQuantity:
      updatedProduct.stockQuantity,
    unit: updatedProduct.unit,
    inventoryId:
      inventory.inventoryId,
  };
};


// ==========================================
// UPDATE PRODUCT STOCK
// ==========================================

export const updateProductStock = async (
  productId: string,
  shopOwnerId: string,
  stockQuantity: number
) => {
  if (stockQuantity < 0) {
    throw new Error(
      "Stock quantity cannot be negative"
    );
  }

  const product =
    await productRepository.findOne({
      where: {
        productId,
        shopOwnerId,
      },
    });

  if (!product) {
    throw new Error("Product not found");
  }

  product.stockQuantity =
    stockQuantity;

  const updatedProduct =
    await productRepository.save(product);

  return {
    productId: updatedProduct.productId,
    name: updatedProduct.name,
    stockQuantity:
      updatedProduct.stockQuantity,
    unit: updatedProduct.unit,
  };
};


// ==========================================
// REMOVE PRODUCT FROM INVENTORY
// ==========================================

export const removeProductFromInventory =
  async (
    productId: string,
    shopOwnerId: string
  ) => {
    const product =
      await productRepository.findOne({
        where: {
          productId,
          shopOwnerId,
        },
        relations: {
          inventory: true,
        },
      });

    if (!product) {
      throw new Error("Product not found");
    }

    /*
     * We keep the Product entity unchanged.
     *
     * Setting inventory to null requires the
     * relationship to allow null. Since your
     * current entity does not explicitly define
     * that, we will NOT use this operation.
     */

    throw new Error(
      "Removing a product from inventory is not supported"
    );
  };