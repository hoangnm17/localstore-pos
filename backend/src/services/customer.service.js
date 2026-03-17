const customerModel = require('../models/customer.model');

exports.getCustomerList = async (filters) => {
    const [data, total] = await Promise.all([
        customerModel.getCustomers(filters),
        customerModel.countCustomers(filters)
    ]);
    return {
        data,
        total,
        totalPages: Math.ceil(total / filters.limit)
    };
};

exports.getCustomerById = async (id) => {
    return await customerModel.getCustomerById(id);
};

exports.createCustomer = async (data) => {

    const { phone } = data;

    if (!phone) {
        throw new Error("Số điện thoại không được để trống");
    }

    const phoneRegex = /^(0|\+84)[0-9]{9}$/;

    if (!phoneRegex.test(phone)) {
        throw new Error("Số điện thoại không hợp lệ");
    }

    const existed = await customerModel.getCustomerByPhone(phone);

    if (existed) {
        throw new Error("Số điện thoại đã tồn tại");
    }

    return await customerModel.createCustomer(data);
};

exports.updateCustomer = async (id, data) => {
    return await customerModel.updateCustomer(id, data);
};

exports.deleteCustomer = async (id) => {
    return await customerModel.deleteCustomer(id);
};

/** Tìm chính xác 1 khách theo số điện thoại — dùng tại quầy thu ngân */
exports.getCustomerByPhone = async (phone) => {
    if (!phone) throw new Error('Số điện thoại không được để trống');
    return await customerModel.getCustomerByPhone(phone.trim());
};

/** Tìm kiếm khách theo số điện thoại (LIKE) — trả về tối đa 10 kết quả */
exports.searchCustomersByPhone = async (phone) => {
    if (!phone) throw new Error('Số điện thoại không được để trống');
    return await customerModel.searchCustomersByPhone(phone.trim());
};

/**
 * Lịch sử mua hàng của khách — UC3: View Purchase History
 */
exports.getPurchaseHistory = async (customerId, { page = 1, limit = 10 } = {}) => {
    const pageNum = Math.max(parseInt(page), 1);
    const pageSize = Math.max(parseInt(limit), 1);
    const offset = (pageNum - 1) * pageSize;

    const [data, total] = await Promise.all([
        customerModel.getPurchaseHistory(customerId, { limit: pageSize, offset }),
        customerModel.countPurchaseHistory(customerId)
    ]);

    return {
        data,
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
    };
};
