const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/tree', categoryController.getCategoryTree);

module.exports = router;