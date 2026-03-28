const { sql } = require("../config/database");

exports.isExisted = async (transaction, sepayId) => {
  const request = new sql.Request(transaction);
  
  const cleanId = typeof sepayId === 'string' 
    ? sepayId.replace(/\D/g, '') 
    : sepayId;

  const result = await request
    .input("sepayId", sql.BigInt, cleanId)
    .query(`
      SELECT id FROM SePayTransactions 
      WHERE sepayId = @sepayId
    `);

  return result.recordset.length > 0;
};

exports.insert = async (transaction, data) => {
  const request = new sql.Request(transaction);
  
  const cleanSepayId = typeof data.sepayId === 'string' 
    ? data.sepayId.replace(/\D/g, '') 
    : data.sepayId;

  return await request
    .input("invoiceId", sql.BigInt, data.invoiceId)
    .input("sepayId", sql.BigInt, cleanSepayId)
    .input("transactionContent", sql.NVarChar(255), data.transactionContent)
    .input("amountIn", sql.Decimal(18, 2), data.amountIn)
    .input("bankAccountNumber", sql.VarChar(50), data.bankAccountNumber)
    .input("transactionDate", sql.DateTime2, data.transactionDate)
    .input("status", sql.VarChar(20), data.status || 'SUCCESS')
    .query(`
      INSERT INTO SePayTransactions (
        invoiceId,
        sepayId,
        transactionContent,
        amountIn,
        bankAccountNumber,
        transactionDate,
        status,
        createdAt
      )
      VALUES (
        @invoiceId,
        @sepayId,
        @transactionContent,
        @amountIn,
        @bankAccountNumber,
        @transactionDate,
        @status,
        GETDATE()
      )
    `);
};

exports.getByInvoiceId = async (invoiceId) => {
  const pool = await connectDB();
  return await pool.request()
    .input("invoiceId", sql.BigInt, invoiceId)
    .query(`
      SELECT * FROM SePayTransactions 
      WHERE invoiceId = @invoiceId 
      ORDER BY createdAt DESC
    `);
};