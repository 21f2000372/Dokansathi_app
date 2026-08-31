import { randomUUID } from "crypto";
import { AppDataSource } from "../config/data-source";
import { Product } from "../entities/Product";

const productRepository =
  AppDataSource.getRepository(Product);

interface CreateProductData {
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  unit: string;
}

interface UpdateProductData {
  name?: string;
  category?: string;
  price?: number;
  stockQuantity?: number;
  unit?: string;
}


// ==========================================
// CREATE PRODUCT
// ==========================================

export const createProduct = async (
  data: CreateProductData,
  shopOwnerId: string
) => {
  const {
    name,
    category,
    price,
    stockQuantity,
    unit,
  } = data;

  const product = productRepository.create({
    productId: randomUUID(),
    name,
    category,
    price,
    stockQuantity,
    unit,
    shopOwnerId,
  });

  const savedProduct =
    await productRepository.save(product);

  return {
    productId: savedProduct.productId,
    name: savedProduct.name,
    category: savedProduct.category,
    price: savedProduct.price,
    stockQuantity: savedProduct.stockQuantity,
    unit: savedProduct.unit,
    shopOwnerId: savedProduct.shopOwnerId,
  };
};


// ==========================================
// GET PRODUCTS
// ==========================================

export const getProducts = async (
  shopOwnerId: string
) => {
  return productRepository.find({
    where: {
      shopOwnerId,
    },
    select: {
      productId: true,
      name: true,
      category: true,
      price: true,
      stockQuantity: true,
      unit: true,
      shopOwnerId: true,
    },
    order: {
      name: "ASC",
    },
  });
};


// ==========================================
// GET SINGLE PRODUCT
// ==========================================

export const getProductById = async (
  productId: string,
  shopOwnerId: string
) => {
  const product =
    await productRepository.findOne({
      where: {
        productId,
        shopOwnerId,
      },
      select: {
        productId: true,
        name: true,
        category: true,
        price: true,
        stockQuantity: true,
        unit: true,
        shopOwnerId: true,
      },
    });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};


// ==========================================
// UPDATE PRODUCT
// ==========================================

export const updateProduct = async (
  productId: string,
  shopOwnerId: string,
  data: UpdateProductData
) => {
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

  if (data.name !== undefined) {
    product.name = data.name;
  }

  if (data.category !== undefined) {
    product.category = data.category;
  }

  if (data.price !== undefined) {
    product.price = data.price;
  }

  if (data.stockQuantity !== undefined) {
    product.stockQuantity =
      data.stockQuantity;
  }

  if (data.unit !== undefined) {
    product.unit = data.unit;
  }

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
    shopOwnerId:
      updatedProduct.shopOwnerId,
  };
};


// ==========================================
// DELETE PRODUCT
// ==========================================

export const deleteProduct = async (
  productId: string,
  shopOwnerId: string
) => {
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

  await productRepository.remove(product);

  return {
    productId,
  };
};

// ==========================================
// GET PRODUCTS FOR CUSTOMER
// ==========================================

export const getProductsForCustomer = async (
  shopOwnerId: string
) => {
  return productRepository.find({
    where: {
      shopOwnerId,
    },
    select: {
      productId: true,
      name: true,
      category: true,
      price: true,
      stockQuantity: true,
      unit: true,
      shopOwnerId: true,
    },
    order: {
      name: "ASC",
    },
  });
};