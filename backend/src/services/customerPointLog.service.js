const customerPointLogModel = require('../models/customerPointLog.model');
const customerModel = require('../models/customer.model');
const { connectDB, sql } = require('../config/database');

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

/**
 * Lấy lịch sử điểm của khách hàng + phân trang
 */
exports.getPointLogs = async (customerId, { page = 1, limit = 20 } = {}) => {
    const pageNum = Math.max(parseInt(page), 1);
    const pageSize = Math.max(parseInt(limit), 1);
    const offset = (pageNum - 1) * pageSize;

    const [data, total] = await Promise.all([
        customerPointLogModel.getPointLogsByCustomerId(customerId, { limit: pageSize, offset }),
        customerPointLogModel.countPointLogsByCustomerId(customerId)
    ]);

    return {
        data,
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
    };
};

/**
 * Điều chỉnh điểm khách hàng thủ công (từ controller/UI)
 * Không yêu cầu transaction bên ngoài
 */
exports.manualAdjustPoints = async (customerId, { pointChange, reason }) => {
    if (!pointChange || pointChange === 0) return 0;
    
    return await runInTransaction(async (transaction) => {
        return await exports.adjustPoints(
            transaction,
            customerId,
            null, // Không có invoiceId
            pointChange,
            reason || "ADJUST_MANUAL"
        );
    });
};

exports.adjustPoints = async (
    transaction,
    customerId,
    invoiceId,
    pointChange,
    reason = "ADJUST"
) => {

    if (!pointChange || pointChange === 0)
        return 0;
    
    const customer = await customerModel.getCustomerForUpdate(
        transaction,
        customerId
    );

    if (!customer)
        throw new Error("Không tìm thấy khách hàng");

    const newPoints = (customer.loyaltyPoints || 0) + pointChange;

    if (newPoints < 0)
        throw new Error(
            `Khách hàng chỉ có ${customer.loyaltyPoints} điểm, không thể trừ thêm ${Math.abs(pointChange)} điểm.`
        );


    await customerModel.updateCustomerPoints(
        transaction,
        customerId,
        newPoints
    );

    await customerPointLogModel.insertPointLog(
        transaction,
        customerId,
        invoiceId,
        pointChange,
        reason
    );

    return pointChange;
};
