import { randomUUID } from "crypto";

import { AppDataSource } from "../config/data-source";

import {
  Order,
  OrderStatus,
} from "../entities/Order";

import { OrderItem } from "../entities/OrderItem";

import { Product } from "../entities/Product";

import { User, UserRole } from "../entities/User";

const orderRepository =
  AppDataSource.getRepository(Order);

const orderItemRepository =
  AppDataSource.getRepository(OrderItem);

const productRepository =
  AppDataSource.getRepository(Product);

const userRepository =
  AppDataSource.getRepository(User);


// ==========================================
// CREATE ORDER
// ==========================================

interface CreateOrderItemData {
  productId: string;
  quantity: number;
}

export const createOrder = async (
  customerId: string,
  items: CreateOrderItemData[]
) => {

  if (!items || items.length === 0) {
    throw new Error(
      "At least one product is required"
    );
  }

  // Find customer
  const customer =
    await userRepository.findOne({
      where: {
        userId: customerId,
        role: UserRole.CUSTOMER,
      },
    });

  if (!customer) {
    throw new Error(
      "Customer not found"
    );
  }

  /*
   * Find all requested products.
   *
   * We also use shopOwnerId from the first
   * product to ensure all products belong
   * to the same shop.
   */

  const firstProduct =
    await productRepository.findOne({
      where: {
        productId: items[0].productId,
      },
    });

  if (!firstProduct) {
    throw new Error(
      "Product not found"
    );
  }

  if (!firstProduct.shopOwnerId) {
    throw new Error(
      "Product does not belong to a shop"
    );
  }

  const shopOwnerId =
    firstProduct.shopOwnerId;

  // Validate all products
  const productMap =
    new Map<string, Product>();

  for (const item of items) {

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error(
        "Quantity must be a positive integer"
      );
    }

    const product =
      await productRepository.findOne({
        where: {
          productId: item.productId,
          shopOwnerId,
        },
      });

    if (!product) {
      throw new Error(
        "Product not found or products belong to different shops"
      );
    }

    if (
      product.stockQuantity <
      item.quantity
    ) {
      throw new Error(
        `Insufficient stock for ${product.name}`
      );
    }

    productMap.set(
      item.productId,
      product
    );
  }

  // Calculate total
  let totalAmount = 0;

  for (const item of items) {

    const product =
      productMap.get(item.productId)!;

    totalAmount +=
      Number(product.price) *
      item.quantity;
  }

  // Create order
  const order =
    orderRepository.create({
      orderId: randomUUID(),
      customer,
      status: OrderStatus.PENDING,
      totalAmount,
      queuePosition: null,
      shopOwnerId,
    });

  const savedOrder =
    await orderRepository.save(order);

  // Create order items and reduce stock
  const savedItems: OrderItem[] = [];

  for (const item of items) {

    const product =
      productMap.get(item.productId)!;

    const orderItem =
      orderItemRepository.create({
        itemId: randomUUID(),
        order: savedOrder,
        product,
        quantity: item.quantity,
        unitPrice: product.price,
      });

    const savedItem =
      await orderItemRepository.save(
        orderItem
      );

    savedItems.push(savedItem);

    product.stockQuantity -=
      item.quantity;

    await productRepository.save(
      product
    );
  }

  return {
    orderId: savedOrder.orderId,
    customerId,
    shopOwnerId,
    status: savedOrder.status,
    totalAmount: savedOrder.totalAmount,
    queuePosition:
      savedOrder.queuePosition,
    items: savedItems.map((item) => ({
      itemId: item.itemId,
      productId: item.product.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    createdAt: savedOrder.createdAt,
  };
};


// ==========================================
// GET CUSTOMER ORDERS
// ==========================================

export const getCustomerOrders = async (
  customerId: string
) => {

  return orderRepository.find({
    where: {
      customer: {
        userId: customerId,
      },
    },
    relations: {
      customer: true,
      items: {
        product: true,
      },
    },
    order: {
      createdAt: "DESC",
    },
  });
};


// ==========================================
// GET SHOP OWNER ORDERS
// ==========================================

export const getShopOwnerOrders = async (
  shopOwnerId: string
) => {

  return orderRepository.find({
    where: {
      shopOwnerId,
    },
    relations: {
      customer: true,
      items: {
        product: true,
      },
    },
    order: {
      createdAt: "DESC",
    },
  });
};


// ==========================================
// GET SINGLE CUSTOMER ORDER
// ==========================================

export const getCustomerOrderById = async (
  orderId: string,
  customerId: string
) => {

  const order =
    await orderRepository.findOne({
      where: {
        orderId,
        customer: {
          userId: customerId,
        },
      },
      relations: {
        customer: true,
        items: {
          product: true,
        },
      },
    });

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  return order;
};


// ==========================================
// GET SINGLE SHOP OWNER ORDER
// ==========================================

export const getShopOwnerOrderById = async (
  orderId: string,
  shopOwnerId: string
) => {

  const order =
    await orderRepository.findOne({
      where: {
        orderId,
        shopOwnerId,
      },
      relations: {
        customer: true,
        items: {
          product: true,
        },
      },
    });

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  return order;
};


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

export const updateOrderStatus = async (
  orderId: string,
  shopOwnerId: string,
  status: OrderStatus
) => {

  const order =
    await orderRepository.findOne({
      where: {
        orderId,
        shopOwnerId,
      },
    });

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  if (
    !Object.values(OrderStatus).includes(
      status
    )
  ) {
    throw new Error(
      "Invalid order status"
    );
  }

  if (
    order.status ===
      OrderStatus.COMPLETED ||
    order.status ===
      OrderStatus.CANCELLED
  ) {
    throw new Error(
      "Completed or cancelled orders cannot be updated"
    );
  }

  order.status = status;

  const updatedOrder =
    await orderRepository.save(order);

  return {
    orderId:
      updatedOrder.orderId,
    status:
      updatedOrder.status,
  };
};


// ==========================================
// CANCEL ORDER
// ==========================================

export const cancelOrder = async (
  orderId: string,
  shopOwnerId: string
) => {

  const order =
    await orderRepository.findOne({
      where: {
        orderId,
        shopOwnerId,
      },
      relations: {
        items: {
          product: true,
        },
      },
    });

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  if (
    order.status ===
      OrderStatus.COMPLETED ||
    order.status ===
      OrderStatus.CANCELLED
  ) {
    throw new Error(
      "Order cannot be cancelled"
    );
  }

  /*
   * Return ordered quantities to stock.
   */

  for (const item of order.items) {

    const product =
      await productRepository.findOne({
        where: {
          productId:
            item.product.productId,
          shopOwnerId,
        },
      });

    if (product) {
      product.stockQuantity +=
        item.quantity;

      await productRepository.save(
        product
      );
    }
  }

  order.status =
    OrderStatus.CANCELLED;

  const cancelledOrder =
    await orderRepository.save(
      order
    );

  return {
    orderId:
      cancelledOrder.orderId,
    status:
      cancelledOrder.status,
  };
};