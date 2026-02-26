const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");
const mockAuth = require("../middleware/mockAuth.js");
const purchaseOrderController = require("../controllers/purchaseOrder.controller");
const supplierController = require("../controllers/supplier.controller");
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");

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
router.put("/products/stock", protect(PERMISSIONS.UPDATE_STOCK), inventoryController.updateProductStock);

// GET products by supplier
router.get("/suppliers/:supplierId/products", inventoryController.getProductsBySupplier);

//POST send problematic report
router.post("/reports/send", mockAuth, inventoryController.createProblematicReport);

//GET get problematic reports
router.get("/reports/list", mockAuth, inventoryController.getProblematicReports);

// CREATE PURCHASE ORDER
router.post("/purchase-orders/request", protect(PERMISSIONS.CREATE_PURCHASE_ORDER), purchaseOrderController.createPurchaseOrder);

// UPDATE PO STATUS
router.patch("/purchase-orders/status/:id", protect(PERMISSIONS.UPDATE_PURCHASE_ORDER), purchaseOrderController.updateStatus);

// // GET LIST PURCHASE ORDERS
router.get("/purchase-orders/list", protect(PERMISSIONS.VIEW_PURCHASE_ORDER), purchaseOrderController.getList);

// // GET PURCHASE ORDER DETAIL
router.get("/purchase-orders/detail/:id", protect(PERMISSIONS.VIEW_PURCHASE_ORDER), purchaseOrderController.getDetail);

// GET SUPPLIER LIST
router.get("/suppliers/list", supplierController.getSupplierList);

router.get("/purchase-orders/report", purchaseOrderController.getMonthlyReport);


module.exports = router;
