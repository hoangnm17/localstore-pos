const express = require('express');
const router = express.Router();
const productUnitcontroller = require('../controllers/productUnit.controller');
const { protect } = require('../middlewares/protect.middleware');
const PERMISSIONS = require('../constants/permissions');

router.get('/', protect(PERMISSIONS.VIEW_PRODUCT_UNIT), productUnitcontroller.getProductUnits);
router.get('/barcode/:barcode', protect(PERMISSIONS.VIEW_PRODUCT_UNIT), productUnitcontroller.getByBarcode);
router.get('/product/:productId', protect(PERMISSIONS.VIEW_PRODUCT_UNIT), productUnitcontroller.getByProduct);

router.post('/', protect(PERMISSIONS.CREATE_PRODUCT_UNIT), productUnitcontroller.create);
router.put('/:id', protect(PERMISSIONS.UPDATE_PRODUCT_UNIT), productUnitcontroller.update);
router.delete('/:id', protect(PERMISSIONS.DELETE_PRODUCT_UNIT), productUnitcontroller.remove);

module.exports = router;