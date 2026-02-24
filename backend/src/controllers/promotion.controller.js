const promotionService = require('../services/promotion.service');

// ─── PROMOTION CRUD ───────────────────────────────────────────────────────────

exports.getPromotions = async (req, res) => {
    try {
        const { search = '', status, type, page = 1, limit = 10 } = req.query;
        const pageNumber = Math.max(parseInt(page), 1);
        const pageSize = Math.max(parseInt(limit), 1);
        const offset = (pageNumber - 1) * pageSize;

        const result = await promotionService.getPromotionList({ search, status, type, limit: pageSize, offset });
        res.json({ success: true, page: pageNumber, limit: pageSize, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPromotionById = async (req, res) => {
    try {
        const promotion = await promotionService.getPromotionById(req.params.id);
        if (!promotion) return res.status(404).json({ success: false, message: 'Không tìm thấy promotion' });
        res.json({ success: true, data: promotion });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createPromotion = async (req, res) => {
    try {
        const promotion = await promotionService.createPromotion(req.body);
        res.status(201).json({ success: true, data: promotion });
    } catch (err) {
        const status = err.message.includes('không hợp lệ') ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

exports.updatePromotion = async (req, res) => {
    try {
        const promotion = await promotionService.updatePromotion(req.params.id, req.body);
        if (!promotion) return res.status(404).json({ success: false, message: 'Không tìm thấy promotion' });
        res.json({ success: true, data: promotion });
    } catch (err) {
        const status = err.message.includes('không hợp lệ') ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

exports.deletePromotion = async (req, res) => {
    try {
        const promotion = await promotionService.deletePromotion(req.params.id);
        if (!promotion) return res.status(404).json({ success: false, message: 'Không tìm thấy promotion' });
        res.json({ success: true, message: 'Promotion đã được vô hiệu hóa', data: promotion });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UC6: ASSIGN PRODUCTS TO PROMOTION ───────────────────────────────────────

/**
 * DELETE /promotions/:id/items/:itemId — xóa 1 item khỏi promotion
 */
exports.removePromotionItem = async (req, res) => {
    try {
        const item = await promotionService.removePromotionItem(req.params.itemId);
        if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy item' });
        res.json({ success: true, message: 'Đã xóa item khỏi promotion', data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * POST /promotions/:id/items — thêm sản phẩm/danh mục vào promotion đã tạo
 * Body: { productId: 5 } hoặc { categoryId: 2 }
 */
exports.addPromotionItem = async (req, res) => {
    try {
        const promotion = await promotionService.addPromotionItem(req.params.id, req.body);
        res.status(201).json({ success: true, message: 'Đã thêm item vào promotion', data: promotion });
    } catch (err) {
        const status = err.message.includes('Không tìm thấy') ? 404 : 400;
        res.status(status).json({ success: false, message: err.message });
    }
};

// ─── UC8: ACTIVE PROMOTIONS (dùng tại quầy thu ngân) ─────────────────────────

/**
 * GET /promotions/active — danh sách promotion đang hiệu lực
 * Cashier gọi để lấy các chương trình KM có thể áp dụng
 */
exports.getActivePromotions = async (req, res) => {
    try {
        const data = await promotionService.getActivePromotions();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UC9: PROMOTION REPORT ────────────────────────────────────────────────────

/**
 * GET /promotions/report?page=1&limit=20
 * Manager xem thống kê số lần dùng và tổng chiết khấu theo từng chương trình KM
 */
exports.getPromotionReport = async (req, res) => {
    try {
        const result = await promotionService.getPromotionReport({
            page: req.query.page,
            limit: req.query.limit
        });
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
