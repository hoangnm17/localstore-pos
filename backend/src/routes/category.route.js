const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middlewares/protect.middleware');
const PERMISSIONS = require('../constants/permissions');

router.get('/tree', protect(PERMISSIONS.VIEW_CATEGORY), categoryController.getCategoryTree);
router.get('/', protect(PERMISSIONS.VIEW_CATEGORY), categoryController.getCategoryList);
router.get('/:id', protect(PERMISSIONS.VIEW_CATEGORY), categoryController.getCategoryById);
router.post('/', protect(PERMISSIONS.CREATE_CATEGORY), categoryController.createCategory);
router.put('/:id', protect(PERMISSIONS.UPDATE_CATEGORY), categoryController.updateCategory);
router.delete('/:id', protect(PERMISSIONS.DELETE_CATEGORY), categoryController.deleteCategory);

module.exports = router;