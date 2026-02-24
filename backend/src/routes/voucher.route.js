const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/voucher.controller');

// ─── SPECIAL (đặt trước /:id) ─────────────────────────────────────────────────
router.post('/validate', ctrl.validateVoucher);   // UC8: cashier validate trước khi áp
router.get('/report', ctrl.getVoucherReport);  // UC10: manager xem báo cáo
router.get('/code/:code', ctrl.getVoucherByCode);  // tra cứu theo mã code

// ─── CRUD ─────────────────────────────────────────────────────────────────────
router.get('/', ctrl.getVouchers);
router.get('/:id', ctrl.getVoucherById);
router.post('/', ctrl.createVoucher);
router.put('/:id', ctrl.updateVoucher);
router.delete('/:id', ctrl.deleteVoucher);

module.exports = router;
