const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const comboController = require('../controllers/productCombo.controller');
const { protect } = require('../middlewares/protect.middleware');
const PERMISSIONS = require('../constants/permissions');

router.get('/', protect(PERMISSIONS.VIEW_PRODUCT), productController.getProducts);
router.get('/:id', protect(PERMISSIONS.VIEW_PRODUCT), productController.getProductById);
router.post('/', protect(PERMISSIONS.CREATE_PRODUCT), productController.createProduct);
router.put('/:id', protect(PERMISSIONS.UPDATE_PRODUCT), productController.updateProduct);
router.delete('/:id', protect(PERMISSIONS.DELETE_PRODUCT), productController.deleteProduct);
router.patch('/:id/start-selling', protect(PERMISSIONS.UPDATE_PRODUCT), productController.startSellingProduct);
router.get('/barcode/:barcode', productController.getProductWithBarcode);

// Combo routes
router.get('/:productId/combos', protect(PERMISSIONS.VIEW_PRODUCT), comboController.getComboItems);
router.post('/:productId/combos', protect(PERMISSIONS.UPDATE_PRODUCT), comboController.addComboItem);
router.delete('/:productId/combos/:comboItemId', protect(PERMISSIONS.UPDATE_PRODUCT), comboController.removeComboItem);

module.exports = router;
