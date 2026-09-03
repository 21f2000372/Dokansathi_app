import { randomUUID } from "crypto";

import { AppDataSource } from "../config/data-source";

import { Order, OrderStatus } from "../entities/Order";

import { OrderItem } from "../entities/OrderItem";

import { Product } from "../entities/Product";

import { User, UserRole } from "../entities/User";

import { createNotification } from "./notificationService";

const orderRepository = AppDataSource.getRepository(Order);

const orderItemRepository = AppDataSource.getRepository(OrderItem);

const productRepository = AppDataSource.getRepository(Product);

const userRepository = AppDataSource.getRepository(User);

// ==========================================
// QUEUE HELPERS (auto-managed)
//
// The queue is fully automatic: an order is
// enqueued on creation and removed once it
// leaves the active flow (completed /
// cancelled / billed). These helpers keep
// queuePosition contiguous per shop.
// ==========================================

/*
 * Assign the next queue position to an order
 * (highest existing position in the shop + 1).
 */
const assignNextQueuePosition = async (
  order: Order,
  shopOwnerId: string,
) => {
  const shopOrders = await orderRepository.find({
    where: { shopOwnerId },
  });

  let highestPosition = 0;

  for (const shopOrder of shopOrders) {
    if (
      shopOrder.queuePosition !== null &&
      shopOrder.queuePosition > highestPosition
    ) {
      highestPosition = shopOrder.queuePosition;
    }
  }

  order.queuePosition = highestPosition + 1;

  return await orderRepository.save(order);
};

/*
 * Remove an order from the queue and shift the
 * remaining orders up so positions stay
 * contiguous (1, 2, 3, ...).
 */
const removeFromQueueAndResequence = async (
  order: Order,
  shopOwnerId: string,
) => {
  if (order.queuePosition === null) {
    return;
  }

  order.queuePosition = null;
  await orderRepository.save(order);

  const remainingOrders = await orderRepository.find({
    where: { shopOwnerId },
    order: { queuePosition: "ASC" },
  });

  let position = 1;

  for (const remainingOrder of remainingOrders) {
    if (remainingOrder.queuePosition !== null) {
      remainingOrder.queuePosition = position;
      position++;
    }
  }

  await orderRepository.save(remainingOrders);
};

// ==========================================
// CREATE ORDER
// ==========================================

interface CreateOrderItemData {
  productId: string;
  quantity: number;
}

export const createOrder = async (
  customerId: string,
  items: CreateOrderItemData[],
) => {
  if (!items || items.length === 0) {
    throw new Error("At least one product is required");
  }

  // Find customer
  const customer = await userRepository.findOne({
    where: {
      userId: customerId,
      role: UserRole.CUSTOMER,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  /*
   * Find all requested products.
   *
   * We also use shopOwnerId from the first
   * product to ensure all products belong
   * to the same shop.
   */

  const firstProduct = await productRepository.findOne({
    where: {
      productId: items[0].productId,
    },
  });

  if (!firstProduct) {
    throw new Error("Product not found");
  }

  if (!firstProduct.shopOwnerId) {
    throw new Error("Product does not belong to a shop");
  }

  const shopOwnerId = firstProduct.shopOwnerId;

  // Validate all products
  const productMap = new Map<string, Product>();

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Quantity must be a positive integer");
    }

    const product = await productRepository.findOne({
      where: {
        productId: item.productId,
        shopOwnerId,
      },
    });

    if (!product) {
      throw new Error(
        "Product not found or products belong to different shops",
      );
    }

    if (product.stockQuantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    productMap.set(item.productId, product);
  }

  // Calculate total
  let totalAmount = 0;

  for (const item of items) {
    const product = productMap.get(item.productId)!;

    totalAmount += Number(product.price) * item.quantity;
  }

  // Create order
  const order = orderRepository.create({
    orderId: randomUUID(),
    customer,
    status: OrderStatus.PENDING,
    totalAmount,
    queuePosition: null,
    shopOwnerId,
  });

  const savedOrder = await orderRepository.save(order);

  // Create order items and reduce stock
  const savedItems: OrderItem[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId)!;

    const orderItem = orderItemRepository.create({
      itemId: randomUUID(),
      order: savedOrder,
      product,
      quantity: item.quantity,
      unitPrice: product.price,
    });

    const savedItem = await orderItemRepository.save(orderItem);

    savedItems.push(savedItem);

    product.stockQuantity -= item.quantity;

    await productRepository.save(product);
  }

  // Notify the shop owner that a new order
  // was received. Non-fatal: a notification
  // failure must not fail the order.
  try {
    await createNotification(
      shopOwnerId,
      savedOrder.orderId,
      `New order received from ${customer.name} — ₹${totalAmount}.`
    );
  } catch (notifyError) {
    console.error(
      "Failed to create owner notification:",
      notifyError
    );
  }

  // Auto-enqueue the new order.
  await assignNextQueuePosition(savedOrder, shopOwnerId);

  return {
    orderId: savedOrder.orderId,
    customerId,
    shopOwnerId,
    status: savedOrder.status,
    totalAmount: savedOrder.totalAmount,
    queuePosition: savedOrder.queuePosition,
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

export const getCustomerOrders = async (customerId: string) => {
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
    select: {
      orderId: true,
      status: true,
      createdAt: true,
      totalAmount: true,
      queuePosition: true,
      shopOwnerId: true,

      customer: {
        userId: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        shopOwnerId: true,
        loyaltyPoints: true,
        availabilityStatus: true,
      },

      items: {
        itemId: true,
        quantity: true,
        unitPrice: true,

        product: {
          productId: true,
          name: true,
          category: true,
          price: true,
          stockQuantity: true,
          unit: true,
          shopOwnerId: true,
        },
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

export const getShopOwnerOrders = async (shopOwnerId: string) => {
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
    select: {
      orderId: true,
      status: true,
      createdAt: true,
      totalAmount: true,
      queuePosition: true,
      shopOwnerId: true,

      customer: {
        userId: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        shopOwnerId: true,
        loyaltyPoints: true,
        availabilityStatus: true,
      },

      items: {
        itemId: true,
        quantity: true,
        unitPrice: true,

        product: {
          productId: true,
          name: true,
          category: true,
          price: true,
          stockQuantity: true,
          unit: true,
          shopOwnerId: true,
        },
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
  customerId: string,
) => {
  const order = await orderRepository.findOne({
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

    select: {
      orderId: true,
      status: true,
      createdAt: true,
      totalAmount: true,
      queuePosition: true,
      shopOwnerId: true,

      customer: {
        userId: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        shopOwnerId: true,
        loyaltyPoints: true,
        availabilityStatus: true,
      },

      items: {
        itemId: true,
        quantity: true,
        unitPrice: true,

        product: {
          productId: true,
          name: true,
          category: true,
          price: true,
          stockQuantity: true,
          unit: true,
          shopOwnerId: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

// ==========================================
// GET SINGLE SHOP OWNER ORDER
// ==========================================

export const getShopOwnerOrderById = async (
  orderId: string,
  shopOwnerId: string,
) => {
  const order = await orderRepository.findOne({
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

    select: {
      orderId: true,
      status: true,
      createdAt: true,
      totalAmount: true,
      queuePosition: true,
      shopOwnerId: true,

      customer: {
        userId: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        shopOwnerId: true,
        loyaltyPoints: true,
        availabilityStatus: true,
      },

      items: {
        itemId: true,
        quantity: true,
        unitPrice: true,

        product: {
          productId: true,
          name: true,
          category: true,
          price: true,
          stockQuantity: true,
          unit: true,
          shopOwnerId: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

// ==========================================
// UPDATE ORDER STATUS
// ==========================================

export const updateOrderStatus = async (
  orderId: string,
  shopOwnerId: string,
  status: OrderStatus,
) => {
  const order = await orderRepository.findOne({
    where: {
      orderId,
      shopOwnerId,
    },
    relations: {
      customer: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (!Object.values(OrderStatus).includes(status)) {
    throw new Error("Invalid order status");
  }

  if (
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.CANCELLED
  ) {
    throw new Error("Completed or cancelled orders cannot be updated");
  }

  order.status = status;

  const updatedOrder = await orderRepository.save(order);

  // Once an order leaves the active flow,
  // pull it out of the queue and re-sequence.
  if (
    updatedOrder.status === OrderStatus.COMPLETED ||
    updatedOrder.status === OrderStatus.CANCELLED
  ) {
    await removeFromQueueAndResequence(updatedOrder, shopOwnerId);
  }

  // Notify the customer when their order is
  // completed. Non-fatal.
  if (updatedOrder.status === OrderStatus.COMPLETED && order.customer) {
    try {
      await createNotification(
        order.customer.userId,
        updatedOrder.orderId,
        `Your order #${updatedOrder.orderId.slice(0, 8)} is completed. Thank you!`,
      );
    } catch (notifyError) {
      console.error(
        "Failed to create customer notification:",
        notifyError,
      );
    }
  }

  return {
    orderId: updatedOrder.orderId,
    status: updatedOrder.status,
  };
};

// ==========================================
// CANCEL CUSTOMER ORDER
// ==========================================

/*
 * Allows a customer to cancel their OWN order,
 * but only while it is still PENDING (i.e. the
 * shop has not started preparing it yet).
 *
 * Restores the reserved stock back to each
 * product, scoped to the order's shop.
 */

export const cancelCustomerOrder = async (
  orderId: string,
  customerId: string,
) => {
  const order = await orderRepository.findOne({
    where: {
      orderId,
      customer: {
        userId: customerId,
      },
    },
    relations: {
      items: {
        product: true,
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new Error("Only pending orders can be cancelled");
  }

  const shopOwnerId = order.shopOwnerId;

  if (!shopOwnerId) {
    throw new Error("Order does not belong to a shop");
  }

  /*
   * Return ordered quantities to stock.
   */

  for (const item of order.items) {
    const product = await productRepository.findOne({
      where: {
        productId: item.product.productId,
        shopOwnerId,
      },
    });

    if (product) {
      product.stockQuantity += item.quantity;

      await productRepository.save(product);
    }
  }

  order.status = OrderStatus.CANCELLED;

  const cancelledOrder = await orderRepository.save(order);

  // Pull the cancelled order out of the queue
  // and re-sequence the rest.
  await removeFromQueueAndResequence(cancelledOrder, shopOwnerId);

  return {
    orderId: cancelledOrder.orderId,
    status: cancelledOrder.status,
  };
};

// ==========================================
// CANCEL ORDER
// ==========================================

export const cancelOrder = async (orderId: string, shopOwnerId: string) => {
  const order = await orderRepository.findOne({
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
    throw new Error("Order not found");
  }

  if (
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.CANCELLED
  ) {
    throw new Error("Order cannot be cancelled");
  }

  /*
   * Return ordered quantities to stock.
   */

  for (const item of order.items) {
    const product = await productRepository.findOne({
      where: {
        productId: item.product.productId,
        shopOwnerId,
      },
    });

    if (product) {
      product.stockQuantity += item.quantity;

      await productRepository.save(product);
    }
  }

  order.status = OrderStatus.CANCELLED;

  const cancelledOrder = await orderRepository.save(order);

  // Pull the cancelled order out of the queue
  // and re-sequence the rest.
  await removeFromQueueAndResequence(cancelledOrder, shopOwnerId);

  return {
    orderId: cancelledOrder.orderId,
    status: cancelledOrder.status,
  };
};


// ==========================================
// SHOP ANALYTICS (REVENUE-BASED)
//
// Aggregates sales performance per product for
// a shop owner using existing data only. Cancelled
// orders are excluded. "Revenue" is the sum of
// quantity * unitPrice across order items.
//
// NOTE: This is revenue/sales performance, not
// true profit, because product cost price is not
// stored in the schema.
// ==========================================

export const getShopAnalytics = async (
  shopOwnerId: string,
) => {
  const orders = await orderRepository.find({
    where: {
      shopOwnerId,
    },
    relations: {
      items: {
        product: true,
      },
    },
  });

  // Only count orders that represent real sales
  // (exclude cancelled orders).
  const countedOrders = orders.filter(
    (order) => order.status !== OrderStatus.CANCELLED,
  );

  // Aggregate per product.
  const productMap = new Map<
    string,
    {
      productId: string;
      name: string;
      unitsSold: number;
      revenue: number;
      orderCount: number;
    }
  >();

  let totalRevenue = 0;

  for (const order of countedOrders) {
    // Track which products appeared in this order
    // so orderCount counts orders, not line items.
    const productsInThisOrder = new Set<string>();

    for (const item of order.items || []) {
      const product = item.product;

      if (!product) {
        continue;
      }

      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const lineRevenue = quantity * unitPrice;

      totalRevenue += lineRevenue;

      const existing = productMap.get(product.productId);

      if (existing) {
        existing.unitsSold += quantity;
        existing.revenue += lineRevenue;

        if (!productsInThisOrder.has(product.productId)) {
          existing.orderCount += 1;
        }
      } else {
        productMap.set(product.productId, {
          productId: product.productId,
          name: product.name,
          unitsSold: quantity,
          revenue: lineRevenue,
          orderCount: 1,
        });
      }

      productsInThisOrder.add(product.productId);
    }
  }

  const products = Array.from(productMap.values())
    .map((entry) => ({
      ...entry,
      revenue: Number(entry.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders: countedOrders.length,
    productCount: products.length,
    products,
  };
};


// ==========================================
// UPDATE CUSTOMER ORDER (QUANTITIES ONLY)
//
// Allows a customer to change the quantities of
// items in their OWN order, but only while it is
// still PENDING (before the shop starts
// preparing it).
//
// Stock is adjusted by the delta for each item:
// increasing a quantity deducts more stock (and
// is validated against availability); decreasing
// returns stock. The order total is recomputed.
//
// Input: updates = [{ itemId, quantity }, ...]
// Quantities must be >= 1. To remove an item,
// the customer cancels the order instead.
// ==========================================

export const updateCustomerOrder = async (
  orderId: string,
  customerId: string,
  updates: { itemId: string; quantity: number }[],
) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error("No item updates provided");
  }

  const order = await orderRepository.findOne({
    where: {
      orderId,
      customer: {
        userId: customerId,
      },
    },
    relations: {
      items: {
        product: true,
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new Error(
      "Only pending orders can be updated",
    );
  }

  const shopOwnerId = order.shopOwnerId;

  if (!shopOwnerId) {
    throw new Error("Order does not belong to a shop");
  }

  // Map the order's current items by itemId.
  const itemsById = new Map<string, OrderItem>();

  for (const item of order.items) {
    itemsById.set(item.itemId, item);
  }

  // Validate every requested update first, so we
  // don't apply partial changes if one is invalid.
  const plan: {
    orderItem: OrderItem;
    product: Product;
    newQuantity: number;
    delta: number;
  }[] = [];

  for (const update of updates) {
    if (
      !Number.isInteger(update.quantity) ||
      update.quantity < 1
    ) {
      throw new Error(
        "Quantity must be a positive integer",
      );
    }

    const orderItem = itemsById.get(update.itemId);

    if (!orderItem) {
      throw new Error("Order item not found");
    }

    // Reload the product (scoped to the shop) to
    // get the current stock.
    const product = await productRepository.findOne({
      where: {
        productId: orderItem.product.productId,
        shopOwnerId,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const delta =
      update.quantity - orderItem.quantity;

    // If increasing, ensure enough stock is
    // available for the additional amount.
    if (delta > 0 && product.stockQuantity < delta) {
      throw new Error(
        `Insufficient stock for ${product.name}`,
      );
    }

    plan.push({
      orderItem,
      product,
      newQuantity: update.quantity,
      delta,
    });
  }

  // Apply the validated changes: adjust stock and
  // update item quantities.
  for (const change of plan) {
    // delta > 0 => deduct extra stock;
    // delta < 0 => return stock.
    change.product.stockQuantity -= change.delta;
    await productRepository.save(change.product);

    change.orderItem.quantity = change.newQuantity;
    await orderItemRepository.save(change.orderItem);
  }

  // Recompute the order total across ALL items
  // (updated and untouched).
  const refreshedItems = await orderItemRepository.find({
    where: {
      order: {
        orderId: order.orderId,
      },
    },
    relations: {
      product: true,
    },
  });

  let totalAmount = 0;

  for (const item of refreshedItems) {
    totalAmount +=
      Number(item.unitPrice) * item.quantity;
  }

  order.totalAmount = totalAmount;

  const updatedOrder = await orderRepository.save(order);

  return {
    orderId: updatedOrder.orderId,
    status: updatedOrder.status,
    totalAmount: updatedOrder.totalAmount,
    items: refreshedItems.map((item) => ({
      itemId: item.itemId,
      productId: item.product.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
};
