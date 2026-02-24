const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');

// Danh sách & chi tiết
router.get('/', promotionController.getPromotions);
router.get('/:id', promotionController.getPromotionById);

// Tạo mới
router.post('/', promotionController.createPromotion);

// Cập nhật (hỗ trợ thay thế toàn bộ items nếu truyền items: [...])
router.put('/:id', promotionController.updatePromotion);

// Soft-delete (status → 'Disabled')
router.delete('/:id', promotionController.deletePromotion);

// Xóa một item cụ thể khỏi PromotionProducts
router.delete('/:id/items/:itemId', promotionController.removePromotionItem);

module.exports = router;
