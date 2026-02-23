const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");
const mockAuth = require("../middleware/mockAuth.js");
const purchaseOrderController = require("../controllers/purchaseOrder.controller");
const supplierController = require("../controllers/supplier.controller");

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

// GET products by supplier
router.get("/suppliers/:supplierId/products", inventoryController.getProductsBySupplier);

//POST send problematic report
router.post("/reports/send", mockAuth, inventoryController.createProblematicReport);

//GET get problematic reports
router.get("/reports/list", mockAuth, inventoryController.getProblematicReports);

// CREATE PURCHASE ORDER
router.post("/purchase-orders/request", mockAuth, purchaseOrderController.createPurchaseOrder);

// UPDATE PO STATUS
router.patch("/purchase-orders/status/:id", mockAuth, purchaseOrderController.updateStatus);

// // GET LIST PURCHASE ORDERS
router.get("/purchase-orders/list",purchaseOrderController.getList);

// // GET PURCHASE ORDER DETAIL
router.get("/purchase-orders/detail/:id",purchaseOrderController.getDetail);

// GET SUPPLIER LIST
router.get("/suppliers/list", supplierController.getSupplierList);


module.exports = router;
