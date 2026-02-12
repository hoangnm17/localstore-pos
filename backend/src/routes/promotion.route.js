const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');

router.get('/', promotionController.getPromotions);
router.get('/:id', promotionController.getPromotionById);
router.post('/', promotionController.createPromotion);

module.exports = router;
