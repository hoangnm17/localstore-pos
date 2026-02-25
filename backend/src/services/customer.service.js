const customerModel = require('../models/customer.model');

const VN_PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;

const validatePhone = (phone) => {
    if (!phone) throw new Error('Số điện thoại không được để trống');

    const cleanedPhone = phone.toString().trim();
    if (!VN_PHONE_REGEX.test(cleanedPhone)) {
        throw new Error('Số điện thoại không đúng định dạng');
    }
    return cleanedPhone;
};

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
    if (data.phone) data.phone = validatePhone(data.phone);
    return await customerModel.createCustomer(data);
};

exports.updateCustomer = async (id, data) => {
    if (data.phone) data.phone = validatePhone(data.phone);
    return await customerModel.updateCustomer(id, data);
};

exports.deleteCustomer = async (id) => {
    return await customerModel.deleteCustomer(id);
};

exports.getCustomerByPhone = async (phone) => {
    return await customerModel.getCustomerByPhone(validatePhone(phone));
};

exports.searchCustomersByPhone = async (phone) => {
    if (!phone) throw new Error('Vui lòng nhập số điện thoại để tìm kiếm');

    const cleanedPhone = phone.toString().trim();
    if (!/^\d+$/.test(cleanedPhone)) {
        throw new Error('Số điện thoại tìm kiếm chỉ được chứa các chữ số');
    }

    return await customerModel.searchCustomersByPhone(cleanedPhone);
};

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