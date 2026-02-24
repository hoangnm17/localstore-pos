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

/**
 * Điều chỉnh điểm thủ công (UC4: Accumulate Loyalty Points — staff thao tác)
 * pointChange > 0: cộng điểm  | pointChange < 0: trừ điểm
 */
exports.adjustPoints = async (customerId, { pointChange, reason }) => {
    if (!pointChange || pointChange === 0) {
        throw new Error('pointChange phải khác 0');
    }

    // Kiểm tra khách tồn tại
    const customer = await customerModel.getCustomerById(customerId);
    if (!customer) throw new Error('Không tìm thấy khách hàng');

    // Không để min điểm < 0
    if (pointChange < 0 && (customer.loyaltyPoints + pointChange) < 0) {
        throw new Error(`Khách chỉ có ${customer.loyaltyPoints} điểm, không thể trừ ${Math.abs(pointChange)} điểm`);
    }

    // Ghi log + cập nhật điểm
    const [log] = await Promise.all([
        customerPointLogModel.addPointLog({ customerId, pointChange, reason }),
        customerModel.updateCustomer(customerId, {
            loyaltyPoints: customer.loyaltyPoints + pointChange
        })
    ]);

    return log;
};
