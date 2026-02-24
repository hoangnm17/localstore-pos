
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const inventoryController = require("../controllers/inventory.controller");

router.get('/', productController.getProducts);
router.get("/products", inventoryController.getProductStockByCategory);

module.exports = router;