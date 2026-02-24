const { connectDB, sql } = require("../config/database.js");

/**
 * Kiểm tra khách hàng đã từng dùng voucher này chưa
 * Dùng khi validate voucher: một số voucher chỉ cho dùng 1 lần/người
 */
exports.hasCustomerUsedVoucher = async (customerId, voucherId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('customerId', sql.BigInt, customerId)
        .input('voucherId', sql.Int, voucherId)
        .query(`
            SELECT COUNT(*) AS cnt
            FROM CustomerVoucherUsage
            WHERE customerId = @customerId AND voucherId = @voucherId
        `);
    return result.recordset[0].cnt > 0;
};

/**
 * Ghi lại việc một khách hàng đã sử dụng voucher trong một hóa đơn
 * Gọi sau khi hóa đơn được thanh toán thành công
 */
exports.recordVoucherUsage = async ({ customerId, voucherId, invoiceId }) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('customerId', sql.BigInt, customerId)
        .input('voucherId', sql.Int, voucherId)
        .input('invoiceId', sql.BigInt, invoiceId)
        .query(`
            INSERT INTO CustomerVoucherUsage (customerId, voucherId, invoiceId)
            OUTPUT INSERTED.*
            VALUES (@customerId, @voucherId, @invoiceId)
        `);
    return result.recordset[0];
};

/**
 * Xem chi tiết danh sách khách hàng đã dùng một voucher cụ thể
 * Dùng khi manager xem ai đã dùng voucher :voucherId
 */
exports.getUsageByVoucherId = async (voucherId, { limit = 20, offset = 0 } = {}) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('voucherId', sql.Int, voucherId)
        .input('limit', sql.Int, parseInt(limit))
        .input('offset', sql.Int, parseInt(offset))
        .query(`
            SELECT
                cvu.id,
                cvu.usedAt,
                c.id    AS customerId,
                c.name  AS customerName,
                c.phone AS customerPhone,
                i.id    AS invoiceId,
                i.invoiceCode,
                i.voucherDiscount,
                i.finalAmount
            FROM CustomerVoucherUsage cvu
            JOIN Customers c ON cvu.customerId = c.id
            JOIN Invoices  i ON cvu.invoiceId  = i.id
            WHERE cvu.voucherId = @voucherId
            ORDER BY cvu.usedAt DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
    return result.recordset;
};

/**
 * Báo cáo tổng hợp: tất cả voucher + số lần dùng + tổng chiết khấu đã cấp
 * Dùng cho UC10: View Voucher Usage Reports
 */
exports.getVoucherUsageReport = async ({ limit = 20, offset = 0 } = {}) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('limit', sql.Int, parseInt(limit))
        .input('offset', sql.Int, parseInt(offset))
        .query(`
            SELECT
                v.id            AS voucherId,
                v.code,
                v.type,
                v.value,
                v.maxUsage,
                v.currentUsage,
                v.status,
                v.startDate,
                v.expiryDate,
                COUNT(cvu.id)               AS timesUsed,
                COALESCE(SUM(i.voucherDiscount), 0) AS totalDiscountGiven
            FROM Vouchers v
            LEFT JOIN CustomerVoucherUsage cvu ON v.id = cvu.voucherId
            LEFT JOIN Invoices i ON cvu.invoiceId = i.id AND i.status = 'PAID'
            GROUP BY
                v.id, v.code, v.type, v.value,
                v.maxUsage, v.currentUsage, v.status,
                v.startDate, v.expiryDate
            ORDER BY timesUsed DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
    return result.recordset;
};

exports.countVoucherUsageReport = async () => {
    const pool = await connectDB();
    const result = await pool.request()
        .query(`SELECT COUNT(*) AS total FROM Vouchers`);
    return result.recordset[0].total;
};
