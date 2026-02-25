const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/customer.controller');

// ─── SEARCH ──────────────────────────────────────────────────────────────────
// Đặt trước /:id để tránh conflict routing
router.get('/by-phone', ctrl.getCustomerByPhone);      // exact match — tại quầy
router.get('/search-phone', ctrl.searchCustomersByPhone);  // LIKE — tìm kiếm UI

// ─── CRUD ────────────────────────────────────────────────────────────────────
router.get('/', ctrl.getCustomers);
router.get('/:id', ctrl.getCustomerById);
router.post('/', ctrl.createCustomer);
router.put('/:id', ctrl.updateCustomer);
router.delete('/:id', ctrl.deleteCustomer);

// ─── UC3: Purchase History ────────────────────────────────────────────────────
router.get('/:id/purchase-history', ctrl.getPurchaseHistory);

// ─── UC4: Loyalty Points ─────────────────────────────────────────────────────
router.get('/:id/point-logs', ctrl.getPointLogs);
router.patch('/:id/points', ctrl.adjustPoints);

module.exports = router;
