const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");

router.get('/', customerController.getCustomers);
router.get('/by-phone', customerController.getCustomerByPhone)
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
