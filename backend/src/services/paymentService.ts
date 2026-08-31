import { AppDataSource } from "../config/data-source";

import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "../entities/Payment";

import { Bill } from "../entities/Bill";

import { randomUUID } from "crypto";

const paymentRepository =
  AppDataSource.getRepository(Payment);

const billRepository =
  AppDataSource.getRepository(Bill);


// ==========================================
// CREATE PAYMENT
// ==========================================

export const createPayment = async (
  billId: string,
  shopOwnerId: string,
  method: PaymentMethod
) => {
  const bill = await billRepository.findOne({
    where: {
      billId,
    },
    relations: {
      order: true,
    },
  });

  if (!bill) {
    throw new Error("Bill not found");
  }

  if (
    bill.order.shopOwnerId !== shopOwnerId
  ) {
    throw new Error(
      "Bill does not belong to this shop"
    );
  }

  if (
    !Object.values(PaymentMethod).includes(method)
  ) {
    throw new Error(
      "Invalid payment method"
    );
  }

  const payment =
    paymentRepository.create({
      paymentId: randomUUID(),
      amount: bill.amount,
      method,
      status: PaymentStatus.PENDING,
    });

  const savedPayment =
    await paymentRepository.save(payment);

  return {
    billId: bill.billId,
    orderId: bill.order.orderId,
    payment: savedPayment,
  };
};


// ==========================================
// GET ALL PAYMENTS
// ==========================================

export const getShopPayments = async (
  _shopOwnerId: string
) => {
  return paymentRepository.find({
    order: {
      paymentId: "DESC",
    },
  });
};


// ==========================================
// GET ONE PAYMENT
// ==========================================

export const getPaymentById = async (
  paymentId: string,
  _shopOwnerId: string
) => {
  const payment =
    await paymentRepository.findOne({
      where: {
        paymentId,
      },
    });

  if (!payment) {
    throw new Error(
      "Payment not found"
    );
  }

  return payment;
};


// ==========================================
// UPDATE PAYMENT STATUS
// ==========================================

export const updatePaymentStatus = async (
  paymentId: string,
  _shopOwnerId: string,
  status: PaymentStatus
) => {
  const payment =
    await paymentRepository.findOne({
      where: {
        paymentId,
      },
    });

  if (!payment) {
    throw new Error(
      "Payment not found"
    );
  }

  if (
    !Object.values(PaymentStatus).includes(status)
  ) {
    throw new Error(
      "Invalid payment status"
    );
  }

  payment.status = status;

  return await paymentRepository.save(
    payment
  );
};