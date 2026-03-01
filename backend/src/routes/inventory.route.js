const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");
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
//router.get("/suppliers/:supplierId/products", inventoryController.getProductsBySupplier);

//POST send problematic report
router.post("/reports/send", protect(PERMISSIONS.CREATE_PROBLEMATIC), inventoryController.createProblematicReport);

//GET get problematic reports
router.get("/reports/list", protect(PERMISSIONS.VIEW_PROBLEMATIC), inventoryController.getProblematicReports);

//PUT update problematic report status
router.put("/reports/:id/status", protect(PERMISSIONS.PROCESS_PROBLEMATIC), inventoryController.updateProblematicStatus);

// CREATE PURCHASE ORDER
router.post("/purchase-orders/request", protect(PERMISSIONS.CREATE_PURCHASE_ORDER), purchaseOrderController.createPurchaseOrder);

// UPDATE PO STATUS
router.patch("/purchase-orders/status/:id", protect(PERMISSIONS.UPDATE_PURCHASE_ORDER), purchaseOrderController.updateStatus);

router.patch("/purchase-orders/receive/:id", protect(PERMISSIONS.RECEIVE_PURCHASE_ORDER), purchaseOrderController.receive);

// // GET LIST PURCHASE ORDERS
router.get("/purchase-orders/list", protect(PERMISSIONS.VIEW_PURCHASE_ORDER), purchaseOrderController.getList);

// // GET PURCHASE ORDER DETAIL
router.get("/purchase-orders/detail/:id", protect(PERMISSIONS.VIEW_PURCHASE_ORDER), purchaseOrderController.getDetail);

// GET SUPPLIER LIST
router.get("/suppliers/list", supplierController.getSupplierList);

// GET SUPPLIER DETAIL
router.get("/suppliers/:id", supplierController.getSupplierDetail);

// GET MONTHLY REPORT
router.get("/purchase-orders/report", purchaseOrderController.getMonthlyReport);

// GET PRODUCTS BY SUPPLIER
router.get("/suppliers/:id/products", supplierController.getSupplierProducts);

// GET PRODUCTS NOT IN SUPPLIER
router.get("/suppliers/:id/products/available", supplierController.getProductsNotInSupplier);

// ADD PRODUCT TO SUPPLIER
router.post("/suppliers/:id/products", supplierController.addProductToSupplier);

// CREATE NEW SUPPLIER
router.post("/create/supplier", supplierController.createSupplier);

// UPDATE PRODUCT OF SUPPLIER
router.put("/suppliers/:id/products/:productId", supplierController.updateProductOfSupplier);


module.exports = router;
