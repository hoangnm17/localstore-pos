const { connectDB, sql } = require("../config/database");

const insertPayment = async (transaction, { invoiceId, paymentMethod, amount, status }) => {
  await transaction.request()
    .input("invoiceId", sql.BigInt, invoiceId)
    .input("paymentMethod", sql.VarChar, paymentMethod)
    .input("amount", sql.Decimal(15, 2), amount)
    .input("status", sql.VarChar, status)
    .query(`
      INSERT INTO Payments
      (invoiceId, paymentMethod, amount, status)
      VALUES
      (@invoiceId, @paymentMethod, @amount, @status)
    `);
};

const updatePaymentStatus = async (transaction, invoiceId, status) => {
  await transaction.request()
    .input("invoiceId", sql.BigInt, invoiceId)
    .input("status", sql.VarChar, status)
    .query(`
      UPDATE Payments
      SET status = @status
      WHERE invoiceId = @invoiceId
    `);
};

module.exports = {
  insertPayment,
  updatePaymentStatus,
};