const voucherModel = require('../models/voucher.model');

exports.getVoucherList = async (filters) => {
    const data = await voucherModel.getVouchers(filters);
    return { data };
};

exports.getVoucherByCode = async (code) => {
    return await voucherModel.getVoucherByCode(code);
};

exports.createVoucher = async (data) => {
    // Logic to generate code if not provided could go here, but assuming frontend sends it or it's required
    return await voucherModel.createVoucher(data);
};
