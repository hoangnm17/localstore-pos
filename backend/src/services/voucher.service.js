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

/**
 * Validate voucher — UC8: Validate & Apply Voucher
 * Cashier gọi API này trước khi áp dụng vào hóa đơn
 */
exports.validateVoucher = async (code, orderAmount) => {
    if (!code) throw new Error('Mã voucher không được để trống');
    return await voucherModel.validateVoucher(code.trim().toUpperCase(), orderAmount || 0);
};

/**
 * Báo cáo hiệu quả voucher — UC10: View Voucher Usage Reports
 */
exports.getVoucherReport = async ({ page = 1, limit = 20 } = {}) => {
    const pageNum = Math.max(parseInt(page), 1);
    const pageSize = Math.max(parseInt(limit), 1);
    const offset = (pageNum - 1) * pageSize;

    const [data, total] = await Promise.all([
        voucherModel.getVoucherReport({ limit: pageSize, offset }),
        voucherModel.countVoucherReport()
    ]);

    return {
        data,
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
    };
};
