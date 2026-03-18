const voucherModel = require('../models/voucher.model');

exports.getVoucherList = async (filters) => {
    const [data, total] = await Promise.all([
        voucherModel.getVouchers(filters),
        voucherModel.countVouchers(filters)
    ]);
    return { data, total, totalPages: Math.ceil(total / (filters.limit || 10)) };
};

exports.getVoucherByCode = async (code, orderValue = 0) => {
    if (!code) {
        throw new Error("Mã giảm giá không được để trống");
    }

    const voucher = await voucherModel.getVoucherByCode(code);

    if (!voucher) {
        throw new Error("Mã giảm giá không tồn tại");
    }

    if (voucher.status !== 'Active') {
        throw new Error("Mã giảm giá hiện không khả dụng hoặc đã bị vô hiệu hóa");
    }

    const now = new Date();
    if (voucher.startDate && now < new Date(voucher.startDate)) {
        throw new Error("Chương trình giảm giá chưa bắt đầu");
    }
    if (voucher.expiryDate && now > new Date(voucher.expiryDate)) {
        throw new Error("Mã giảm giá đã hết hạn sử dụng");
    }

    if (voucher.maxUsage !== null && voucher.currentUsage >= voucher.maxUsage) {
        throw new Error("Mã giảm giá đã hết lượt sử dụng");
    }
    if (Number(orderValue) < Number(voucher.minOrderValue)) {
        throw new Error(`Đơn hàng tối thiểu phải từ ${new Intl.NumberFormat('vi-VN').format(voucher.minOrderValue)}đ để áp dụng mã này`);
    }

    return voucher;
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
