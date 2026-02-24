const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/tree', categoryController.getCategoryTree);
router.get('/', categoryController.getCategoryList);
router.get('/:id', categoryController.getCategoryById);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;