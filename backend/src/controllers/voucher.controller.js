const voucherService = require('../services/voucher.service');

// ─── VOUCHER CRUD ─────────────────────────────────────────────────────────────

exports.getVouchers = async (req, res) => {
    try {
        const { search = '', status, page = 1, limit = 10 } = req.query;
        const pageNumber = Math.max(parseInt(page), 1);
        const pageSize = Math.max(parseInt(limit), 1);
        const offset = (pageNumber - 1) * pageSize;

        const result = await voucherService.getVoucherList({ search, status, limit: pageSize, offset });
        res.json({ success: true, page: pageNumber, limit: pageSize, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// voucher.controller.js
exports.getVoucherByCode = async (req, res) => {
    try {
        const { code } = req.params;
        // Lấy subtotal từ query string (ví dụ: ?subtotal=150000)
        const subtotal = Number(req.query.subtotal) || 0; 

        const voucher = await voucherService.getVoucherByCode(code, subtotal);
        
        // Nếu service không ném lỗi, trả về dữ liệu thành công
        return res.status(200).json({ 
            success: true, 
            data: voucher 
        });
    } catch (err) {
        // Trả về lỗi 400 (Bad Request) cho các lỗi logic như: hết hạn, chưa đủ tiền đơn hàng...
        // Trả về lỗi 404 nếu không tìm thấy mã
        const statusCode = err.message === "Mã giảm giá không tồn tại" ? 404 : 400;
        
        return res.status(statusCode).json({ 
            success: false, 
            message: err.message 
        });
    }
};

exports.getVoucherById = async (req, res) => {
    try {
        const voucher = await voucherService.getVoucherById(req.params.id);
        if (!voucher) return res.status(404).json({ success: false, message: 'Voucher không tồn tại' });
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
        // Mọi lỗi từ validateFields hoặc lỗi trùng mã đều nên trả về 400
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateVoucher = async (req, res) => {
    try {
        const voucher = await voucherService.updateVoucher(req.params.id, req.body);
        if (!voucher) return res.status(404).json({ success: false, message: 'Voucher không tồn tại' });
        res.json({ success: true, data: voucher });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteVoucher = async (req, res) => {
    try {
        const voucher = await voucherService.deleteVoucher(req.params.id);
        if (!voucher) return res.status(404).json({ success: false, message: 'Voucher không tồn tại' });
        res.json({ success: true, message: 'Voucher đã bị vô hiệu hóa', data: voucher });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UC8: VALIDATE & APPLY VOUCHER ──────────────────────────────────────────

/**
 * POST /vouchers/validate
 * Body: { code: "ABC123", orderAmount: 500000 }
 * Cashier gọi trước khi áp dụng voucher vào hóa đơn
 */
exports.validateVoucher = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        if (!code) return res.status(400).json({ success: false, message: 'Thiếu mã voucher' });

        const result = await voucherService.validateVoucher(code, orderAmount);

        // Trả 200 dù hợp lệ hay không — client đọc result.valid để xử lý
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UC10: VOUCHER USAGE REPORT ──────────────────────────────────────────────

/**
 * GET /vouchers/report?page=1&limit=20
 * Manager xem thống kê số lần dùng và tổng chiết khấu đã cấp theo từng voucher
 */
exports.getVoucherReport = async (req, res) => {
    try {
        const result = await voucherService.getVoucherReport({
            page: req.query.page,
            limit: req.query.limit
        });
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
