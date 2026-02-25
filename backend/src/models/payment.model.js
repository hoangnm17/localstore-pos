const { connectDB, sql } = require("../config/database");

const createPayment = async ({ invoiceId, paymentMethod, amount }) => {
//   try {
//     const pool = await connectDB();

//     await pool
//       .request()
//       .input("invoiceId", sql.BigInt, invoiceId)
//       .input("paymentMethod", sql.VarChar, paymentMethod)
//       .input("amount", sql.Decimal(15, 2), amount)
//       .input("status", sql.VarChar, "PENDING")
//       .query(`
//         INSERT INTO Payments
//         (invoiceId, paymentMethod, amount, status)
//         VALUES
//         (@invoiceId, @paymentMethod, @amount, @status)
//       `);
//   } catch (err) {
//     console.error("createPayment error:", err);
//     throw err;
//   }
};

const updatePaymentStatus = async (invoiceId, status) => {
  try {
    const pool = await connectDB();

    await pool
      .request()
      .input("invoiceId", sql.BigInt, invoiceId)
      .input("status", sql.VarChar, status)
      .query(`
        UPDATE Payments
        SET status = @status
        WHERE invoiceId = @invoiceId
      `);
  } catch (err) {
    console.error("updatePaymentStatus error:", err);
    throw err;
  }
};

module.exports = {
  createPayment,
  updatePaymentStatus,
};
