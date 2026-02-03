const express = require('express');
const router = express.Router();
const controller = require('../controllers/productUnit.controller');

router.get('/', controller.getProductUnits);
router.get('/barcode/:barcode', controller.getByBarcode);
router.get('/product/:productId', controller.getByProduct);

router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;