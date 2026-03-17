const sql = require("mssql");
const { connectDB } = require("../config/database");
const invoiceModel = require("../models/invoice.model");
const paymentModel = require("../models/payment.model");
const inventoryService = require("./InventoryServices/inventory.service");
const voucherModel = require("../models/voucher.model");
const customerPointLogService = require("./customerPointLog.service");
const promotionModel = require("../models/promotion.model");
const customerModel = require("../models/customer.model");
const sseService = require("./sse.service");
const socketService = require("./socket.service");

const POINT_EXCHANGE = 100;
const EARN_POINT_EXCHANGE = 10000;
const EXPIRE_MINUTES = 0.5;

const getEditableInvoice = async (transaction, id) => {

  const invoice = await invoiceModel.getInvoiceById(
    transaction,
    id,
    { forUpdate: true }
  );

  if (!invoice)
    throw new Error("Invoice not found");

  if (["PAID", "CANCELLED"].includes(invoice.status))
    throw new Error("Cannot update this invoice");

  return invoice;
};

const runInTransaction = async (callback) => {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (err) {
    try {
      await transaction.rollback();
    } catch (_) { }
    throw err;
  }
};

const getBankConfig = () => {
  return {
    bankCode: process.env.BANK_CODE || "BIDV",
    accountNumber: process.env.BANK_ACCOUNT || "96247HNM17",
    accountName: process.env.ACCOUNT_NAME || "NGUYEN MINH HOANG",
    template: process.env.SEPAY_QR_TEMPLATE || "compact2",
  };
};

const validateDiscount = async (customerId, discount, totalAmount) => {

  if (!discount || Object.keys(discount).length === 0) {
    return {
      finalAmount: totalAmount,
      totalDiscount: 0,
      pointDiscount: 0,
      voucherDiscount: 0,
      promotionDiscount: 0,
      actualPointUsed: 0
    };
  }

  let totalDiscount = 0;

  let pointDiscount = 0;
  let voucherDiscount = 0;
  let promotionDiscount = 0;

  let actualPointUsed = 0;

  if (discount?.voucherId) {

    const voucher = await voucherModel.getVoucherById(discount.voucherId);

    if (!voucher)
      throw new Error("Voucher not found");

    if (voucher.status !== "Active")
      throw new Error("Voucher is not active");

    if (voucher.currentUsage >= voucher.maxUsage)
      throw new Error("Voucher usage exceeded");

    if (totalAmount < voucher.minOrderValue)
      throw new Error("Voucher condition not satisfied");

    if (voucher.type === "Percent") {
      voucherDiscount = Math.floor(totalAmount * voucher.value / 100);
    } else {
      voucherDiscount = voucher.value;
    }

    voucherDiscount = Math.min(voucherDiscount, totalAmount);

    totalDiscount += voucherDiscount;
  }

  if (discount?.promotionId) {

    const promotion = await promotionModel.getPromotionById(discount.promotionId);

    if (!promotion)
      throw new Error("Promotion not found");

    if (promotion.status !== "Active")
      throw new Error("Promotion is not active");

    if (promotion.startDate && new Date() < promotion.startDate)
      throw new Error("Promotion not started")

    if (promotion.endDate && new Date() > promotion.endDate)
      throw new Error("Promotion expired")

    if (promotion.type === "Percent") {
      promotionDiscount = Math.floor(totalAmount * promotion.value / 100);
    } else {
      promotionDiscount = promotion.value;
    }

    const remaining = totalAmount - totalDiscount;

    promotionDiscount = Math.min(promotionDiscount, remaining);

    totalDiscount += promotionDiscount;
  }

  if (discount?.pointUsed > 0) {

    if (!customerId)
      throw new Error("Customer required to use loyalty points");

    const customer = await customerModel.getCustomerById(customerId);

    if (!customer)
      throw new Error("Customer not found");

    if (discount.pointUsed > customer.loyaltyPoints)
      throw new Error("Cannot use loyalty point over current point!");

    const rawPointDiscount =
      discount.pointUsed * POINT_EXCHANGE;

    const remaining =
      totalAmount - totalDiscount;

    pointDiscount =
      Math.min(rawPointDiscount, remaining);

    actualPointUsed =
      Math.floor(pointDiscount / POINT_EXCHANGE);

    pointDiscount =
      actualPointUsed * POINT_EXCHANGE;

    totalDiscount += pointDiscount;
  }

  const finalAmount =
    Math.max(totalAmount - totalDiscount, 0);

  return {
    finalAmount,
    totalDiscount,
    pointDiscount,
    voucherDiscount,
    promotionDiscount,
    actualPointUsed
  };
};

const payCash = async (id, { payment }) => {

  return runInTransaction(async (transaction) => {

    const invoice = await getEditableInvoice(transaction, id);

    if (payment?.method !== "CASH")
      throw new Error("Invalid payment method");

    const invoiceItems = await invoiceModel.getInvoiceItems(transaction, id);

    if (!invoiceItems.length)
      throw new Error("Cannot pay empty invoice");

    let totalAmount = invoice.totalAmount;
    let finalAmount = totalAmount;

    let totalDiscount = 0;
    let pointDiscount = 0;
    let promotionDiscount = 0;
    let voucherDiscount = 0;
    let actualPointUsed = 0;

    if (payment?.discount) {

      const discountResult =
        await validateDiscount(
          invoice.customerId,
          payment.discount,
          totalAmount
        );

      totalDiscount = discountResult.totalDiscount;
      finalAmount = discountResult.finalAmount;
      pointDiscount = discountResult.pointDiscount;
      promotionDiscount = discountResult.promotionDiscount;
      voucherDiscount = discountResult.voucherDiscount;
      actualPointUsed = discountResult.actualPointUsed;
    }

    const payAmount = Number(payment.amount ?? finalAmount);

    if (!Number.isFinite(payAmount) || payAmount < 0)
      throw new Error("Invalid payment amount");

    if (payAmount < finalAmount)
      throw new Error("Payment amount is not enough");

    await paymentModel.updatePaymentCancel(
      transaction,
      id,
      "FAILED"
    );

    /* ================= CREATE / UPDATE PAYMENT ================= */

    const existingPayment =
      await invoiceModel.getPaymentByInvoiceId(transaction, id);

    if (!existingPayment) {

      await invoiceModel.insertPayment(transaction, {
        invoiceId: id,
        paymentMethod: "CASH",
        amount: finalAmount,
        status: "SUCCESS"
      });

    } else {

      await paymentModel.updatePayment(transaction, {
        invoiceId: id,
        amount: finalAmount,
        status: "SUCCESS",
        paymentMethod: "CASH",
        transactionId: "CASH"
      });

    }

    /* ================= APPLY DISCOUNT EFFECT ================= */

    if (actualPointUsed > 0 && invoice.customerId) {

      await customerPointLogService.adjustPoints(
        transaction,
        invoice.customerId,
        id,
        -actualPointUsed,
        "REDEEM"
      );
    }

    if (payment.discount?.voucherId) {

      await voucherModel.increaseUsage(
        transaction,
        payment.discount.voucherId
      );
    }

    /* ================= EARN POINT ================= */

    const earnedPoints =
      Math.floor(finalAmount / EARN_POINT_EXCHANGE);

    if (earnedPoints > 0 && invoice.customerId) {

      await customerPointLogService.adjustPoints(
        transaction,
        invoice.customerId,
        id,
        earnedPoints,
        "EARN"
      );
    }

    /* ================= UPDATE INVOICE ================= */

    await invoiceModel.updateInvoiceDiscount(
      transaction,
      id,
      payment.discount?.promotionId,
      promotionDiscount,
      payment.discount?.voucherId,
      voucherDiscount,
      actualPointUsed,
      pointDiscount
    );

    await invoiceModel.updateAmounts(transaction, id, {
      totalAmount,
      finalAmount
    });

    /* ================= STOCK ================= */

    const updatedStocks = await inventoryService.deductStock(
      transaction,
      invoiceItems
    );

    socketService.emitInventoryUpdate(updatedStocks);

    await invoiceModel.updateStatus(transaction, id, "PAID");

    return {
      paid: true,
      finalAmount,
      totalDiscount
    };

  });
};

const createQR = async (invoiceId, discount = {}) => {
  console.log("INOIVE", invoiceId);

  return runInTransaction(async (transaction) => {

    const invoice = await invoiceModel.getInvoiceById(transaction, invoiceId, {
      forUpdate: true,
    });

    if (!invoice) throw new Error("Invoice not found");

    if (["PAID", "CANCELLED"].includes(invoice.status)) {
      throw new Error("Cannot create QR for this invoice");
    }

    const items = await invoiceModel.getInvoiceItems(transaction, invoiceId);
    if (!items.length) throw new Error("Cannot pay empty invoice");

    const totalAmount = Number(invoice.totalAmount || 0);
    let finalAmount = totalAmount;
    let promotionDiscount = 0;
    let voucherDiscount = 0;
    let pointDiscount = 0;
    let pointUsed = 0;
    let promotionId = null;
    let voucherId = null;

    if (discount) {
      const result = await validateDiscount(
        invoice.customerId,
        discount,
        totalAmount
      );

      finalAmount = result.finalAmount;
      promotionDiscount = result.promotionDiscount;
      voucherDiscount = result.voucherDiscount;
      pointDiscount = result.pointDiscount;
      pointUsed = result.actualPointUsed;

      promotionId = discount?.promotionId || null;
      voucherId = discount?.voucherId || null;
    }

    if (finalAmount <= 0) throw new Error("Invalid invoice amount");

    const existingPayment = await invoiceModel.getPaymentByInvoiceId(
      transaction,
      invoiceId
    );

    const oldAmount = Number(existingPayment?.amount || 0);

    if (
      existingPayment &&
      invoice.status === "PENDING" &&
      invoice.expiresAt &&
      new Date() < new Date(invoice.expiresAt) &&
      oldAmount === finalAmount
    ) {
      const { bankCode, accountNumber, accountName, template } = getBankConfig();
      const content = `POS-${invoiceId}`;

      const qrUrl =
        `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.png` +
        `?amount=${encodeURIComponent(oldAmount)}` +
        `&addInfo=${encodeURIComponent(content)}` +
        `&accountName=${encodeURIComponent(accountName)}`;

      return {
        pending: true,
        reuse: true,
        qr: {
          url: qrUrl,
          content,
          amount: oldAmount,
          expiresAt: invoice.expiresAt,
        }
      };
    }
    await invoiceModel.updateInvoiceDiscount(
      transaction,
      invoiceId,
      promotionId,
      promotionDiscount,
      voucherId,
      voucherDiscount,
      pointUsed,
      pointDiscount
    );

    if (!existingPayment) {
      await invoiceModel.insertPayment(transaction, {
        invoiceId,
        paymentMethod: "BANK_TRANSFER",
        amount: finalAmount,
        status: "PENDING",
      });
    } else {
      if (existingPayment.status === "SUCCESS") {
        throw new Error("Invoice already paid");
      }

      await paymentModel.updatePayment(transaction, {
        invoiceId,
        amount: finalAmount,
        status: "PENDING",
      });
    }

    const expiresAt = new Date(Date.now() + EXPIRE_MINUTES * 60 * 1000);

    await invoiceModel.updateStatus(transaction, invoiceId, "PENDING");
    await invoiceModel.updateInvoiceExpire(transaction, invoiceId, expiresAt);

    /* ===== GENERATE QR ===== */
    const { bankCode, accountNumber, accountName, template } = getBankConfig();

    const content = `POS-${invoiceId}`;

    const qrUrl =
      `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.png` +
      `?amount=${encodeURIComponent(finalAmount)}` +
      `&addInfo=${encodeURIComponent(content)}` +
      `&accountName=${encodeURIComponent(accountName)}`;

    return {
      invoiceId,
      invoiceCode: invoice.invoiceCode,
      totalAmount,
      finalAmount,
      paymentMethod: "BANK_TRANSFER",

      qr: {
        url: qrUrl,
        content,
        amount: finalAmount,
        expiresAt,
      },
      discount: {
        promotionId,
        voucherId,
        promotionDiscount,
        voucherDiscount,
        pointUsed,
        pointDiscount,
        totalDiscount:
          promotionDiscount +
          voucherDiscount +
          pointDiscount,
      },
    };
  });
};

const confirmPayment = async (payload) => {
  return runInTransaction(async (transaction) => {

    const transferAmount = Number(
      payload.transferAmount ??
      payload.amount ??
      payload.transfer_amount
    );

    const content = String(
      payload.content ??
      payload.description ??
      payload.transferContent ??
      ""
    ).trim();

    const transactionId =
      payload.transactionId ??
      payload.id ??
      payload.transaction_id ??
      null;

    if (!content) {
      throw new Error("Missing transfer content");
    }

    const match = content.match(/POS-(\d+)/i);
    if (!match) {
      throw new Error("Invalid transfer content");
    }

    const invoiceId = Number(match[1]);
    const invoice = await invoiceModel.getInvoiceById(transaction, invoiceId, {
      forUpdate: true,
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status === "PAID") {
      return { paid: true, duplicated: true, invoiceId };
    }

    if (invoice.status !== "PENDING") {
      throw new Error("Invoice is not awaiting payment");
    }

    if (invoice.expiresAt && new Date() > new Date(invoice.expiresAt)) {
      await invoiceModel.updateStatus(transaction, invoiceId, "FAILED");
      await paymentModel.updatePaymentStatus(
        transaction,
        invoiceId,
        "FAILED"
      );

      throw new Error("QR expired");
    }

    if (transactionId) {
      const existed = await paymentModel.findByTransactionId(
        transaction,
        transactionId
      );

      if (existed) {
        return { paid: true, duplicated: true, invoiceId };
      }
    }

    const payment = await invoiceModel.getPaymentByInvoiceId(
      transaction,
      invoiceId
    );

    if (payment && payment.status === "SUCCESS") {
      return { paid: true, duplicated: true, invoiceId };
    }

    if (!invoice.finalAmount) {
      throw new Error("Invoice amount not finalized");
    }

    const expectedAmount = Number(invoice.finalAmount || invoice.totalAmount);

    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
      throw new Error("Invalid transfer amount");
    }

    if (transferAmount < expectedAmount) {
      throw new Error("Transfer amount is not enough");
    }

    if (!payment) {

      await invoiceModel.insertPayment(transaction, {
        invoiceId,
        paymentMethod: "BANK_QR",
        amount: expectedAmount,
        status: "SUCCESS",
        transactionId,
      });

    } else {

      await paymentModel.updatePaymentStatus(
        transaction,
        invoiceId,
        "SUCCESS",
        transactionId
      );

    }

    const invoiceItems = await invoiceModel.getInvoiceItems(
      transaction,
      invoiceId
    );

    if (!invoiceItems.length) {
      throw new Error("Invoice has no items");
    }

    const pointUsed = Number(invoice.usedPoints || 0);
    const voucherId = invoice.voucherId || null;

    const finalAmount = expectedAmount;

    if (pointUsed > 0 && invoice.customerId) {

      await customerPointLogService.adjustPoints(
        transaction,
        invoice.customerId,
        invoiceId,
        -pointUsed,
        "REDEEM"
      );

    }

    if (voucherId) {
      await voucherModel.increaseUsage(transaction, voucherId);
    }

    const earnedPoints = Math.floor(finalAmount / EARN_POINT_EXCHANGE);

    if (earnedPoints > 0 && invoice.customerId) {

      await customerPointLogService.adjustPoints(
        transaction,
        invoice.customerId,
        invoiceId,
        earnedPoints,
        "EARN"
      );

    }

    const updatedStocks = await inventoryService.deductStock(
      transaction,
      invoiceItems
    );

    socketService.emitInventoryUpdate(updatedStocks);

    await invoiceModel.updateStatus(
      transaction,
      invoiceId,
      "PAID"
    );


    sseService.send({
      type: "PAYMENT_SUCCESS",
      invoiceId,
      method: "BANK_TRANSFER",
      amount: finalAmount,
    });

    return {
      paid: true,
      invoiceId,
      amount: finalAmount,
    };

  });
};

const cancelPendingPayment = async (invoiceId) => {
  return runInTransaction(async (transaction) => {

    const invoice = await invoiceModel.getInvoiceById(transaction, invoiceId, {
      forUpdate: true,
    });

    await invoiceModel.updateInvoiceExpire(transaction, invoiceId, null);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status === "PAID") {
      throw new Error("Cannot cancel paid invoice");
    }

    await paymentModel.updatePaymentCancel(
      transaction,
      invoiceId,
      "FAILED"
    );

    await invoiceModel.updateStatus(
      transaction,
      invoiceId,
      "UNPAID"
    );

    return { success: true };
  });
};

module.exports = {
  createQR,
  confirmPayment,
  payCash,
  cancelPendingPayment,
};