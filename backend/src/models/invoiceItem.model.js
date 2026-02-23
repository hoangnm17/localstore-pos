const { connectDB, sql } = require("../config/database");

const createItem = async ({
    invoiceId,
    productId,
    productName,
    unitPrice,
    quantity,
    lineTotal,
}) => {
    //   try {
    //     const pool = await connectDB();

    //     await pool
    //       .request()
    //       .input("invoiceId", sql.BigInt, invoiceId)
    //       .input("productId", sql.BigInt, productId)
    //       .input("productName", sql.NVarChar, productName)
    //       .input("unitPrice", sql.Decimal(15, 2), unitPrice)
    //       .input("quantity", sql.Int, quantity)
    //       .input("lineTotal", sql.Decimal(15, 2), lineTotal)
    //       .query(`
    //         INSERT INTO InvoiceItems
    //         (invoiceId, productId, productName, unitPrice, quantity, lineTotal)
    //         VALUES
    //         (@invoiceId, @productId, @productName, @unitPrice, @quantity, @lineTotal)
    //       `);
    //   } catch (err) {
    //     console.error("createItem error:", err);
    //     throw err;
    //   }
    console.log("ok");

};

const getByInvoiceId = async (invoiceId) => {
  const pool = await connectDB();

  const result = await pool.request()
    .input("invoiceId", sql.BigInt, invoiceId)
    .query(`
      SELECT *
      FROM InvoiceItems
      WHERE invoiceId = @invoiceId
    `);

  return result.recordset;
};

module.exports = {
    createItem,
    getByInvoiceId,
};
