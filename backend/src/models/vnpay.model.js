const { connectDB, sql } = require("../config/database");

const createVnPayTransaction = async ({
  invoiceId,
  txnRef,
  payUrl,
}) => {
//   try {
//     const pool = await connectDB();

//     await pool
//       .request()
//       .input("invoiceId", sql.BigInt, invoiceId)
//       .input("txnRef", sql.VarChar, txnRef)
//       .input("payUrl", sql.NVarChar, payUrl)
//       .input("status", sql.VarChar, "INIT")
//       .query(`
//         INSERT INTO VnPayTransactions
//         (invoiceId, txnRef, payUrl, status)
//         VALUES
//         (@invoiceId, @txnRef, @payUrl, @status)
//       `);
//   } catch (err) {
//     console.error("createVnPayTransaction error:", err);
//     throw err;
//   }
};

const updateVnPayStatus = async (
  invoiceId,
  status,
  responseCode
) => {
//   try {
//     const pool = await connectDB();

//     await pool
//       .request()
//       .input("invoiceId", sql.BigInt, invoiceId)
//       .input("status", sql.VarChar, status)
//       .input("responseCode", sql.VarChar, responseCode)
//       .query(`
//         UPDATE VnPayTransactions
//         SET status = @status,
//             responseCode = @responseCode
//         WHERE invoiceId = @invoiceId
//       `);
//   } catch (err) {
//     console.error("updateVnPayStatus error:", err);
//     throw err;
//   }
};

module.exports = {
  createVnPayTransaction,
  updateVnPayStatus,
};
