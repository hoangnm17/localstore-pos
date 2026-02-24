const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');

router.get('/', voucherController.getVouchers);
router.get('/code/:code', voucherController.getVoucherByCode);
router.get('/:id', voucherController.getVoucherById);
router.post('/', voucherController.createVoucher);
router.put('/:id', voucherController.updateVoucher);
router.delete('/:id', voucherController.deleteVoucher);

module.exports = router;
