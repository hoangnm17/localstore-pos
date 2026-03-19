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

const updatePaymentSuccess = async (transaction, paymentId, status) => {
  await transaction.request()
    .input("paymentId", sql.BigInt, paymentId)
    .input("status", sql.VarChar, status)
    .query(`
      UPDATE Payments
      SET status = @status
      WHERE id = @paymentId
    `);
};

const updatePayment = async (transaction, data) => {
  const request = new sql.Request(transaction);

  const result = await request
    .input("invoiceId", sql.BigInt, Number(data.invoiceId))
    .input("amount", sql.Decimal(15, 2), data.amount)
    .input("paymentMethod", sql.VarChar(20), data.paymentMethod)
    .input("status", sql.VarChar(20), data.status)
    .query(`
      UPDATE Payments
      SET 
        amount = @amount,
        paymentMethod = @paymentMethod,
        status = @status
      WHERE invoiceId = @invoiceId
    `);

  return result.rowsAffected[0];
};

const findByTransactionId = async (transaction, transactionId) => {
  const result = await new sql.Request(transaction)
    .input("transactionId", sql.VarChar(100), transactionId)
    .query(`
      SELECT TOP 1 *
      FROM Payments
      WHERE transactionId = @transactionId
    `);

  return result.recordset[0];
};


const updatePaymentCancel = async (transaction, invoiceId, status) => {
  await new sql.Request(transaction)
    .input("invoiceId", sql.BigInt, Number(invoiceId))
    .input("status", sql.VarChar(20), status)
    .query(`
      UPDATE Payments
      SET status = @status
      WHERE invoiceId = @invoiceId AND status = 'PENDING'
    `);
};


const findLatestPendingPayment = async (transaction, invoiceId) => {
  const request = new sql.Request(transaction);

  const result = await request
    .input("invoiceId", sql.Int, invoiceId)
    .query(`
      SELECT TOP 1 *
      FROM Payments
      WHERE invoiceId = @invoiceId
        AND status = 'PENDING'
      ORDER BY createdAt DESC
    `);

  return result.recordset[0] || null;
};

const cancelPendingPayments = async (transaction, invoiceId) => {
  const request = transaction.request();

  const result = await request
    .input("invoiceId", sql.Int, invoiceId)
    .query(`
      UPDATE Payments
      SET 
        status = 'CANCELLED'
      WHERE invoiceId = @invoiceId
        AND status = 'PENDING'
    `);

  return result.rowsAffected[0] || 0; 
};

module.exports = {
  insertPayment,
  updatePaymentStatus,
  updatePayment,
  findByTransactionId,
  updatePaymentCancel,
  findLatestPendingPayment,
  cancelPendingPayments,
  updatePaymentSuccess
};