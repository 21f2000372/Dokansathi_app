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


/*
 * NOTE ON DATA MODEL
 * ------------------
 * The `payments` table only has its own scalar
 * columns (paymentId, amount, method, status).
 * There is no bill/order foreign key column in
 * the database, so a payment cannot be joined
 * to a bill at the DB level.
 *
 * To respect the existing schema (no table
 * changes), this service reads/writes only the
 * payments table's own columns. The frontend
 * associates a payment to its bill by matching
 * on amount.
 */


// ==========================================
// CREATE PAYMENT
//
// The bill is used only to validate ownership
// and to copy its amount onto the payment. The
// payment row itself stores no bill reference.
// ==========================================

export const createPayment = async (
  billId: string,
  shopOwnerId: string,
  method: PaymentMethod
) => {
  const bill = await billRepository
    .createQueryBuilder("bill")
    .leftJoinAndSelect("bill.order", "order")
    .where("bill.billId = :billId", { billId })
    .getOne();

  if (!bill) {
    throw new Error("Bill not found");
  }

  if (bill.order.shopOwnerId !== shopOwnerId) {
    throw new Error(
      "Bill does not belong to this shop"
    );
  }

  if (
    !Object.values(PaymentMethod).includes(method)
  ) {
    throw new Error("Invalid payment method");
  }

  const payment = paymentRepository.create({
    paymentId: randomUUID(),
    amount: bill.amount,
    method,
    status: PaymentStatus.PENDING,
  });

  const savedPayment =
    await paymentRepository.save(payment);

  return {
    paymentId: savedPayment.paymentId,
    billId: bill.billId,
    orderId: bill.order.orderId,
    amount: savedPayment.amount,
    method: savedPayment.method,
    status: savedPayment.status,
  };
};


// ==========================================
// GET ALL PAYMENTS
//
// Returns this shop's payments. Because there
// is no bill FK on payments, we scope by
// matching payment amounts against this shop's
// bill amounts.
// ==========================================

export const getShopPayments = async (
  shopOwnerId: string
) => {
  // Amounts of all bills belonging to this shop.
  const shopBills = await billRepository
    .createQueryBuilder("bill")
    .leftJoin("bill.order", "order")
    .where("order.shopOwnerId = :shopOwnerId", {
      shopOwnerId,
    })
    .select(["bill.amount"])
    .getMany();

  const shopBillAmounts = new Set(
    shopBills.map((bill) => String(bill.amount))
  );

  const allPayments = await paymentRepository.find({
    order: {
      paymentId: "DESC",
    },
  });

  // Only payments whose amount matches one of
  // this shop's bills.
  return allPayments.filter((payment) =>
    shopBillAmounts.has(String(payment.amount))
  );
};


// ==========================================
// GET ONE PAYMENT
// ==========================================

export const getPaymentById = async (
  paymentId: string,
  _shopOwnerId: string
) => {
  const payment = await paymentRepository.findOne({
    where: {
      paymentId,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
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
  if (
    !Object.values(PaymentStatus).includes(status)
  ) {
    throw new Error("Invalid payment status");
  }

  const payment = await paymentRepository.findOne({
    where: {
      paymentId,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  payment.status = status;

  const savedPayment =
    await paymentRepository.save(payment);

  return {
    paymentId: savedPayment.paymentId,
    status: savedPayment.status,
  };
};
