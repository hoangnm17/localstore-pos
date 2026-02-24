const voucherModel = require('../models/voucher.model');

exports.getVoucherList = async (filters) => {
    const [data, total] = await Promise.all([
        voucherModel.getVouchers(filters),
        voucherModel.countVouchers(filters)
    ]);
    return { data, total, totalPages: Math.ceil(total / (filters.limit || 10)) };
};

exports.getVoucherByCode = async (code) => {
    return await voucherModel.getVoucherByCode(code);
};

exports.getVoucherById = async (id) => {
    return await voucherModel.getVoucherById(id);
};

exports.createVoucher = async (data) => {
    return await voucherModel.createVoucher(data);
};

exports.updateVoucher = async (id, data) => {
    return await voucherModel.updateVoucher(id, data);
};

exports.deleteVoucher = async (id) => {
    return await voucherModel.deleteVoucher(id);
};
