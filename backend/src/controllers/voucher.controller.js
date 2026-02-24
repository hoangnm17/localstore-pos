const voucherService = require('../services/voucher.service');

exports.getVouchers = async (req, res) => {
    try {
        const {
            search = '',
            status,
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Math.max(parseInt(page), 1);
        const pageSize = Math.max(parseInt(limit), 1);
        const offset = (pageNumber - 1) * pageSize;

        const result = await voucherService.getVoucherList({
            search,
            status,
            limit: pageSize,
            offset
        });

        res.json({
            success: true,
            page: pageNumber,
            limit: pageSize,
            ...result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getVoucherByCode = async (req, res) => {
    try {
        const voucher = await voucherService.getVoucherByCode(req.params.code);
        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }
        res.json({ success: true, data: voucher });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createVoucher = async (req, res) => {
    try {
        const voucher = await voucherService.createVoucher(req.body);
        res.status(201).json({ success: true, data: voucher });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
