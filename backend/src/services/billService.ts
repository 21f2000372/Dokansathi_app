import { AppDataSource } from "../config/data-source";

import { Bill } from "../entities/Bill";
import {
  Order,
  OrderStatus,
} from "../entities/Order";

import { randomUUID } from "crypto";

const billRepository =
  AppDataSource.getRepository(Bill);

const orderRepository =
  AppDataSource.getRepository(Order);


// ==========================================
// GENERATE BILL
// ==========================================

export const createBill = async (
  orderId: string,
  shopOwnerId: string
) => {
  // Find order belonging to this shop
  const order =
    await orderRepository.findOne({
      where: {
        orderId,
        shopOwnerId,
      },
    });

  if (!order) {
    throw new Error(
      "Order not found or does not belong to this shop"
    );
  }

  // Don't generate multiple bills
  const existingBill =
    await billRepository.findOne({
      where: {
        order: {
          orderId,
        },
      },
    });

  if (existingBill) {
    throw new Error(
      "Bill already exists for this order"
    );
  }

  // Cancelled orders cannot be billed
  if (
    order.status === OrderStatus.CANCELLED
  ) {
    throw new Error(
      "Cancelled orders cannot be billed"
    );
  }

  const bill =
    billRepository.create({
      billId: randomUUID(),
      order,
      amount: order.totalAmount,
      generatedAt: new Date(),
    });

  const savedBill =
    await billRepository.save(bill);

  // Update order status
  order.status = OrderStatus.BILLED;

  // Once billed, remove it from active queue
  order.queuePosition = null;

  await orderRepository.save(order);

  return savedBill;
};


// ==========================================
// GET SHOP BILLS
// ==========================================

export const getShopBills = async (
  shopOwnerId: string
) => {
  return billRepository
    .createQueryBuilder("bill")
    .leftJoinAndSelect(
      "bill.order",
      "order"
    )
    .where(
      "order.shopOwnerId = :shopOwnerId",
      { shopOwnerId }
    )
    .select([
      "bill.billId",
      "bill.amount",
      "bill.generatedAt",

      "order.orderId",
      "order.status",
      "order.totalAmount",
      "order.createdAt",
      "order.shopOwnerId",
    ])
    .orderBy(
      "bill.generatedAt",
      "DESC"
    )
    .getMany();
};


// ==========================================
// GET ONE BILL
// ==========================================

export const getBillById = async (
  billId: string,
  shopOwnerId: string
) => {
  const bill =
    await billRepository
      .createQueryBuilder("bill")
      .leftJoinAndSelect(
        "bill.order",
        "order"
      )
      .where(
        "bill.billId = :billId",
        { billId }
      )
      .andWhere(
        "order.shopOwnerId = :shopOwnerId",
        { shopOwnerId }
      )
      .select([
        "bill.billId",
        "bill.amount",
        "bill.generatedAt",

        "order.orderId",
        "order.status",
        "order.totalAmount",
        "order.createdAt",
        "order.shopOwnerId",
      ])
      .getOne();

  if (!bill) {
    throw new Error(
      "Bill not found"
    );
  }

  return bill;
};


// ==========================================
// GET BILL BY ORDER
// ==========================================

export const getBillByOrder = async (
  orderId: string,
  shopOwnerId: string
) => {
  const bill =
    await billRepository
      .createQueryBuilder("bill")
      .leftJoinAndSelect(
        "bill.order",
        "order"
      )
      .where(
        "order.orderId = :orderId",
        { orderId }
      )
      .andWhere(
        "order.shopOwnerId = :shopOwnerId",
        { shopOwnerId }
      )
      .select([
        "bill.billId",
        "bill.amount",
        "bill.generatedAt",

        "order.orderId",
        "order.status",
        "order.totalAmount",
        "order.createdAt",
        "order.shopOwnerId",
      ])
      .getOne();

  if (!bill) {
    throw new Error(
      "Bill not found"
    );
  }

  return bill;
};