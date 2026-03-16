const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/promotion.controller');

// ─── SPECIAL (đặt trước /:id) ─────────────────────────────────────────────────
router.get('/active', ctrl.getActivePromotions);  // UC8: cashier lấy KM đang hiệu lực
router.get('/report', ctrl.getPromotionReport);   // UC9: manager xem báo cáo hiệu quả KM
router.get('/discount', ctrl.getProductDiscount); // Lấy % giảm giá theo productId + productUnitId

// ─── CRUD ─────────────────────────────────────────────────────────────────────
router.get('/', ctrl.getPromotions);
router.get('/:id', ctrl.getPromotionById);
router.post('/', ctrl.createPromotion);         // UC5: tạo chương trình KM
router.put('/:id', ctrl.updatePromotion);
router.delete('/:id', ctrl.deletePromotion);

// ─── UC6: Assign Products to Promotion ───────────────────────────────────────
router.post('/:id/items', ctrl.addPromotionItem);     // thêm sản phẩm/danh mục
router.delete('/:id/items/:itemId', ctrl.removePromotionItem);  // xóa sản phẩm/danh mục

module.exports = router;
