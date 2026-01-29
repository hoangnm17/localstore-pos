const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");

/**
 * Category stock
 * GET /api/inventory/categories
 */
router.get("/categories", inventoryController.getCategoryStock);

/**
 * Product stock by category (SEARCH + PAGING)
 * GET /api/inventory/categories/:categoryId/products
 */
router.get("/categories/:categoryId/products", inventoryController.getProductStockByCategory);

// PUT update stock
router.put("/products/stock", inventoryController.updateProductStock);

module.exports = router;
