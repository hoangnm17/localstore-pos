const express = require('express');
const router = express.Router();
const priceHistoryController = require('../controllers/priceHistory.controller');
const { protect } = require('../middlewares/protect.middleware');
const PERMISSIONS = require('../constants/permissions');

router.get('/:productId', protect(PERMISSIONS.VIEW_PRODUCT), priceHistoryController.getByProductId);

module.exports = router;
