const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
//const inventoryController = require("../controllers/inventory.controller");

router.get('/', productController.getProducts);
//router.get("/products", inventoryController.getProductStockByCategory);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/start-selling', productController.startSellingProduct);

module.exports = router;