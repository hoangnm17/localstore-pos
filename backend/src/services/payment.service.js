const sql = require("mssql");
const { connectDB } = require("../config/database");
const invoiceModel = require("../models/invoice.model");
const paymentModel = require("../models/payment.model");
const inventoryService = require("./InventoryServices/inventory.service");
const voucherModel = require("../models/voucher.model");
const customerPointLogService = require("./customerPointLog.service");
const sseService = require("./sse.service");
const invoiceService = require("./invoice.service")
const socketService = require("./socket.service");

const EARN_POINT_EXCHANGE = 10000;

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

const createQR = async (invoiceId, discount = {}) => {
  return runInTransaction(async (transaction) => {

    /* ================= GET INVOICE ================= */

    const invoice = await invoiceModel.getInvoiceById(transaction, invoiceId, {
      forUpdate: true,
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (["PAID", "CANCELLED"].includes(invoice.status)) {
      throw new Error("Cannot create QR for this invoice");
    }

    const invoiceItems = await invoiceModel.getInvoiceItems(transaction, invoiceId);

    if (!invoiceItems.length) {
      throw new Error("Cannot pay empty invoice");
    }

    const totalAmount = Number(invoice.totalAmount || 0);

    /* ================= VALIDATE DISCOUNT ================= */

    let finalAmount = totalAmount;

    let promotionDiscount = 0;
    let voucherDiscount = 0;
    let pointDiscount = 0;
    let pointUsed = 0;

    let promotionId = null;
    let voucherId = null;

    if (discount) {

      const discountResult = await invoiceService.validateDiscount(
        invoice.customerId,
        discount,
        totalAmount
      );

      finalAmount = discountResult.finalAmount;

      promotionDiscount = discountResult.promotionDiscount;
      voucherDiscount = discountResult.voucherDiscount;
      pointDiscount = discountResult.pointDiscount;
      pointUsed = discountResult.actualPointUsed;

      promotionId = discount?.promotionId || null;
      voucherId = discount?.voucherId || null;
    }

    if (finalAmount <= 0) {
      throw new Error("Invalid invoice amount");
    }

    /* ================= SAVE DISCOUNT ================= */

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

    /* ================= CREATE / UPDATE PAYMENT ================= */

    const existingPayment = await invoiceModel.getPaymentByInvoiceId(
      transaction,
      invoiceId
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

      await paymentModel.updatePaymentStatus(
        transaction,
        invoiceId,
        "PENDING"
      );
    }

    /* ================= GENERATE QR ================= */

    const { bankCode, accountNumber, accountName, template } = getBankConfig();

    const content = `POS-${invoiceId}`;

    const qrUrl =
      `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.png` +
      `?amount=${encodeURIComponent(finalAmount)}` +
      `&addInfo=${encodeURIComponent(content)}` +
      `&accountName=${encodeURIComponent(accountName)}`;

    /* ================= RESPONSE ================= */

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

    /* ================= PARSE WEBHOOK ================= */

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

    /* ================= PARSE INVOICE ================= */

    const match = content.match(/POS-(\d+)/i);

    if (!match) {
      throw new Error("Invalid transfer content");
    }

    const invoiceId = Number(match[1]);

    /* ================= LOCK INVOICE ================= */

    const invoice = await invoiceModel.getInvoiceById(transaction, invoiceId, {
      forUpdate: true,
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status === "PAID") {
      return { paid: true, duplicated: true, invoiceId };
    }

    if (invoice.status === "CANCELLED") {
      throw new Error("Invoice is cancelled");
    }

    /* ================= GET PAYMENT ================= */

    const payment = await invoiceModel.getPaymentByInvoiceId(
      transaction,
      invoiceId
    );

    if (payment && payment.status === "SUCCESS") {
      return { paid: true, duplicated: true, invoiceId };
    }

    const expectedAmount = Number(invoice.finalAmount || invoice.totalAmount);

    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
      throw new Error("Invalid transfer amount");
    }

    if (transferAmount < expectedAmount) {
      throw new Error("Transfer amount is not enough");
    }

    /* ================= UPDATE PAYMENT ================= */

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

    /* ================= GET ITEMS ================= */

    const invoiceItems = await invoiceModel.getInvoiceItems(
      transaction,
      invoiceId
    );

    if (!invoiceItems.length) {
      throw new Error("Invoice has no items");
    }

    /* ================= DISCOUNT INFO ================= */

    const pointUsed = Number(invoice.usedPoints || 0);
    const voucherId = invoice.voucherId || null;

    const finalAmount = expectedAmount;

    /* ================= REDEEM POINT ================= */

    if (pointUsed > 0 && invoice.customerId) {

      await customerPointLogService.adjustPoints(
        transaction,
        invoice.customerId,
        invoiceId,
        -pointUsed,
        "REDEEM"
      );

    }

    /* ================= VOUCHER USAGE ================= */

    if (voucherId) {

      await voucherModel.increaseUsage(
        transaction,
        voucherId
      );

    }

    /* ================= EARN POINT ================= */

    const earnedPoints =
      Math.floor(finalAmount / EARN_POINT_EXCHANGE);

    if (earnedPoints > 0 && invoice.customerId) {

      await customerPointLogService.adjustPoints(
        transaction,
        invoice.customerId,
        invoiceId,
        earnedPoints,
        "EARN"
      );

    }

    /* ================= DEDUCT STOCK ================= */

    const updatedStocks = await inventoryService.deductStock(
      transaction,
      invoiceItems
    );

    socketService.emitInventoryUpdate(updatedStocks);

    /* ================= UPDATE INVOICE ================= */

    await invoiceModel.updateStatus(
      transaction,
      invoiceId,
      "PAID"
    );

    /* ================= SSE REALTIME ================= */

    sseService.send({
      type: "PAYMENT_SUCCESS",
      invoiceId,
      method: "BANK_TRANSFER",
      amount: finalAmount,
    });

    /* ================= RESPONSE ================= */

    return {
      paid: true,
      invoiceId,
      amount: finalAmount,
    };

  });
};

module.exports = {
  createQR,
  confirmPayment,
};