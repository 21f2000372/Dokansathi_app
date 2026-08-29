import { AppDataSource } from "../config/data-source";

import {
  Order,
  OrderStatus,
} from "../entities/Order";

const orderRepository =
  AppDataSource.getRepository(Order);


// ==========================================
// ADD ORDER TO QUEUE
// ==========================================

export const addOrderToQueue = async (
  orderId: string,
  shopOwnerId: string
) => {
  const order =
    await orderRepository.findOne({
      where: {
        orderId,
        shopOwnerId,
      },
    });

  if (!order) {
    throw new Error("Order not found");
  }

  // Completed/cancelled orders cannot enter queue
  if (
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.CANCELLED
  ) {
    throw new Error(
      "Completed or cancelled orders cannot be added to the queue"
    );
  }

  // Already in queue
  if (order.queuePosition !== null) {
    return order;
  }

  /*
   * Get all orders belonging to this shop.
   */
  const shopOrders =
    await orderRepository.find({
      where: {
        shopOwnerId,
      },
    });

  /*
   * Find the highest existing queue position.
   */
  let highestPosition = 0;

  for (const shopOrder of shopOrders) {
    if (
      shopOrder.queuePosition !== null &&
      shopOrder.queuePosition > highestPosition
    ) {
      highestPosition =
        shopOrder.queuePosition;
    }
  }

  /*
   * Assign the next queue position.
   */
  order.queuePosition =
    highestPosition + 1;

  return await orderRepository.save(
    order
  );
};

// ==========================================
// GET SHOP QUEUE
// ==========================================

export const getShopQueue = async (
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
      queuePosition: "ASC",
    },
  });
};


// ==========================================
// GET ONE QUEUED ORDER
// ==========================================

export const getQueueOrder = async (
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

  if (order.queuePosition === null) {
    throw new Error(
      "Order is not currently in the queue"
    );
  }

  return order;
};


// ==========================================
// UPDATE QUEUE POSITION
// ==========================================

export const updateQueuePosition = async (
  orderId: string,
  shopOwnerId: string,
  newPosition: number
) => {
  if (
    !Number.isInteger(newPosition) ||
    newPosition < 1
  ) {
    throw new Error(
      "Queue position must be a positive integer"
    );
  }

  const order =
    await orderRepository.findOne({
      where: {
        orderId,
        shopOwnerId,
      },
    });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.queuePosition === null) {
    throw new Error(
      "Order is not currently in the queue"
    );
  }

  const oldPosition =
    order.queuePosition;

  if (
    oldPosition === newPosition
  ) {
    return order;
  }

  /*
   * Get all queued orders for this shop.
   */
  const queuedOrders =
    await orderRepository.find({
      where: {
        shopOwnerId,
      },
      order: {
        queuePosition: "ASC",
      },
    });

  const otherOrders =
    queuedOrders.filter(
      (item) =>
        item.orderId !== orderId &&
        item.queuePosition !== null
    );

  /*
   * Remove the current order from
   * the queue and rebuild positions.
   */
  otherOrders.splice(
    Math.max(
      0,
      Math.min(
        newPosition - 1,
        otherOrders.length
      )
    ),
    0,
    order
  );

  /*
   * Reassign positions sequentially.
   */
  for (
    let index = 0;
    index < otherOrders.length;
    index++
  ) {
    otherOrders[index].queuePosition =
      index + 1;
  }

  await orderRepository.save(
    otherOrders
  );

  return otherOrders.find(
    (item) =>
      item.orderId === orderId
  );
};


// ==========================================
// REMOVE ORDER FROM QUEUE
// ==========================================

export const removeOrderFromQueue =
  async (
    orderId: string,
    shopOwnerId: string
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

    if (order.queuePosition === null) {
      throw new Error(
        "Order is not currently in the queue"
      );
    }

    const removedPosition =
      order.queuePosition;

    order.queuePosition = null;

    await orderRepository.save(order);

    /*
     * Shift the remaining orders forward.
     */
    const remainingOrders =
      await orderRepository.find({
        where: {
          shopOwnerId,
        },
        order: {
          queuePosition: "ASC",
        },
      });

    let position = 1;

    for (
      const remainingOrder of remainingOrders
    ) {
      if (
        remainingOrder.queuePosition !== null
      ) {
        remainingOrder.queuePosition =
          position;

        position++;
      }
    }

    await orderRepository.save(
      remainingOrders
    );

    return {
      orderId,
      previousPosition:
        removedPosition,
      queuePosition: null,
    };
  };