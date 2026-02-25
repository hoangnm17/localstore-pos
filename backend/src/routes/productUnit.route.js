const express = require('express');
const router = express.Router();
const productUnitcontroller = require('../controllers/productUnit.controller');

router.get('/', productUnitcontroller.getProductUnits);
router.get('/barcode', productUnitcontroller.getByBarcode);
router.get('/product', productUnitcontroller.getByProduct);

router.post('/', productUnitcontroller.create);
router.put('/:id', productUnitcontroller.update);
router.delete('/:id', productUnitcontroller.remove);

module.exports = router;