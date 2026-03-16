const { connectDB, sql } = require("../config/database.js");

/**
 * Lấy lịch sử tích/tiêu điểm của một khách hàng
 * JOIN với Invoices để lấy invoiceCode cho hiển thị
 */
exports.getPointLogsByCustomerId = async (customerId, { limit = 20, offset = 0 } = {}) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('customerId', sql.BigInt, customerId)
        .input('limit', sql.Int, parseInt(limit))
        .input('offset', sql.Int, parseInt(offset))
        .query(`
            SELECT
                cpl.id,
                cpl.customerId,
                cpl.invoiceId,
                cpl.pointChange,
                cpl.reason,
                cpl.createdAt,
                i.invoiceCode
            FROM CustomerPointLogs cpl
            LEFT JOIN Invoices i ON cpl.invoiceId = i.id
            WHERE cpl.customerId = @customerId
            ORDER BY cpl.createdAt DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
    return result.recordset;
};

/**
 * Đếm tổng số log điểm của khách — dùng cho phân trang
 */
exports.countPointLogsByCustomerId = async (customerId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('customerId', sql.BigInt, customerId)
        .query(`SELECT COUNT(*) AS total FROM CustomerPointLogs WHERE customerId = @customerId`);
    return result.recordset[0].total;
};

/**
 * Ghi log điểm mới (tích điểm hoặc tiêu điểm)
 * pointChange > 0: tích điểm | pointChange < 0: tiêu điểm
 */
exports.addPointLog = async ({ customerId, invoiceId = null, pointChange, reason = null }) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('customerId', sql.BigInt, customerId)
        .input('invoiceId', sql.BigInt, invoiceId)
        .input('pointChange', sql.Int, pointChange)
        .input('reason', sql.NVarChar, reason)
        .query(`
            INSERT INTO CustomerPointLogs (customerId, invoiceId, pointChange, reason)
            OUTPUT INSERTED.*
            VALUES (@customerId, @invoiceId, @pointChange, @reason)
        `);
    return result.recordset[0];
};

exports.insertPointLog = async (
    transaction,
    customerId,
    invoiceId,
    pointChange,
    reason
) => {

    await new sql.Request(transaction)
        .input("customerId", sql.Int, customerId)
        .input("invoiceId", sql.Int, invoiceId)
        .input("pointChange", sql.Int, pointChange)
        .input("reason", sql.VarChar, reason)
        .query(`
            INSERT INTO CustomerPointLogs
            (customerId, invoiceId, pointChange, reason)
            VALUES (@customerId, @invoiceId, @pointChange, @reason)
        `);

};