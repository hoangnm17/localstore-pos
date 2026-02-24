const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');

router.get('/', voucherController.getVouchers);
router.get('/code/:code', voucherController.getVoucherByCode);
router.post('/', voucherController.createVoucher);

module.exports = router;
