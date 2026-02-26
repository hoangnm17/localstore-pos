const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect } = require('../middlewares/protect.middleware');
const PERMISSIONS = require('../constants/permissions');

router.get('/', protect(PERMISSIONS.VIEW_PRODUCT), productController.getProducts);
router.get('/:id', protect(PERMISSIONS.VIEW_PRODUCT), productController.getProductById);
router.post('/', protect(PERMISSIONS.CREATE_PRODUCT), productController.createProduct);
router.put('/:id', protect(PERMISSIONS.UPDATE_PRODUCT), productController.updateProduct);
router.delete('/:id', protect(PERMISSIONS.DELETE_PRODUCT), productController.deleteProduct);
router.patch('/:id/start-selling', protect(PERMISSIONS.UPDATE_PRODUCT), productController.startSellingProduct);

module.exports = router;