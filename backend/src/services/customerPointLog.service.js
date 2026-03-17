const customerPointLogModel = require('../models/customerPointLog.model');
const customerModel = require('../models/customer.model');

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
        throw new Error("Customer not found");

    const newPoints = customer.loyaltyPoints + pointChange;

    if (newPoints < 0)
        throw new Error(
            `Customer only has ${customer.loyaltyPoints} points`
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

