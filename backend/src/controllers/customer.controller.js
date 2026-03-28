const customerService = require('../services/customer.service');
const pointLogService = require('../services/customerPointLog.service');

// ─── CUSTOMER CRUD ───────────────────────────────────────────────────────────

exports.getCustomers = async (req, res) => {
    try {
        const { search = '', status, page = 1, limit = 10 } = req.query;
        const pageNumber = Math.max(parseInt(page), 1);
        const pageSize = Math.max(parseInt(limit), 1);
        const offset = (pageNumber - 1) * pageSize;

        const result = await customerService.getCustomerList({ search, status, limit: pageSize, offset });
        res.json({ success: true, page: pageNumber, limit: pageSize, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id);
        if (!customer) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
        res.json({ success: true, data: customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json({ success: true, data: customer });
    } catch (err) {
        const status = (err.message.includes('số âm') || err.message.includes('không hợp lệ')) ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const customer = await customerService.updateCustomer(req.params.id, req.body);
        if (!customer) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
        res.json({ success: true, data: customer });
    } catch (err) {
        const status = (err.message.includes('số âm') || err.message.includes('không hợp lệ')) ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await customerService.deleteCustomer(req.params.id);
        if (!customer) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
        res.json({ success: true, message: 'Khách hàng đã bị vô hiệu hóa', data: customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── TÌM KIẾM THEO SĐT ──────────────────────────────────────────────────────

/** GET /customers/by-phone?phone=... — tìm chính xác 1 khách (dùng tại quầy) */
exports.getCustomerByPhone = async (req, res) => {
    try {
        const { phone } = req.query;
        const customer = await customerService.getCustomerByPhone(phone);
        if (!customer) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
        res.json({ success: true, data: customer });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

/** GET /customers/search-phone?phone=... — tìm LIKE, trả về danh sách (dùng UI) */
exports.searchCustomersByPhone = async (req, res) => {
    try {
        const { phone } = req.query;
        const data = await customerService.searchCustomersByPhone(phone);
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─── UC3: PURCHASE HISTORY ───────────────────────────────────────────────────

/** GET /customers/:id/purchase-history?page=1&limit=10 */
exports.getPurchaseHistory = async (req, res) => {
    try {
        const result = await customerService.getPurchaseHistory(
            req.params.id,
            { page: req.query.page, limit: req.query.limit }
        );
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UC4: LOYALTY POINTS ─────────────────────────────────────────────────────

/** GET /customers/:id/point-logs?page=1&limit=20 */
exports.getPointLogs = async (req, res) => {
    try {
        const result = await pointLogService.getPointLogs(
            req.params.id,
            { page: req.query.page, limit: req.query.limit }
        );
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/** PATCH /customers/:id/points — điều chỉnh điểm thủ công */
exports.adjustPoints = async (req, res) => {
    try {
        const { pointChange, reason } = req.body;
        const log = await pointLogService.manualAdjustPoints(req.params.id, { pointChange, reason });
        res.json({ success: true, message: 'Cập nhật điểm thành công', data: log });
    } catch (err) {
        const status = err.message.includes('Không tìm thấy') ? 404 : 400;
        res.status(status).json({ success: false, message: err.message });
    }
};