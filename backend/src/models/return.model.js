const { connectDB, sql } = require("../config/database");

exports.createReturn = async (transaction, data) => {

    const request = new sql.Request(transaction);

    const result = await request
        .input("invoiceId", data.invoiceId)
        .input("counterId", data.counterId)
        .input("staffId", data.staffId)
        .input("returnType", data.returnType)
        .input("refundMethod", data.refundMethod)
        .input("totalRefundAmount", data.totalRefundAmount)
        .input("reason", data.reason)
        .query(`
      INSERT INTO Returns
      (invoiceId, counterId, staffId, returnType, refundMethod, totalRefundAmount, reason)
      OUTPUT INSERTED.id
      VALUES
      (@invoiceId, @counterId, @staffId, @returnType, @refundMethod, @totalRefundAmount, @reason)
    `);

    return result.recordset[0].id;

};