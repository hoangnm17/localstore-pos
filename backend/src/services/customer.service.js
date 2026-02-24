const customerModel = require('../models/customer.model');

exports.getCustomerList = async (filters) => {
    const data = await customerModel.getCustomers(filters);
    const total = await customerModel.countCustomers(filters);

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
    return await customerModel.createCustomer(data);
};

exports.updateCustomer = async (id, data) => {
    return await customerModel.updateCustomer(id, data);
};

exports.deleteCustomer = async (id) => {
    return await customerModel.deleteCustomer(id);
};

exports.getCustomerByPhone = async (phone) => {
    if (!phone) {
        throw new Error("Phone is required");
    }

    const cleanPhone = phone.trim();

    const customer = await customerModel.getCustomerByPhone(cleanPhone);

    return customer;
};
