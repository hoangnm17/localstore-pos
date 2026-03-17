const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");
const invoiceController = require("../controllers/invoice.controller")

router.get("/", protect(PERMISSIONS.VIEW_PRODUCT), invoiceController.getAllInvoice)
router.post("/", protect(PERMISSIONS.VIEW_PRODUCT), invoiceController.createInvoice);
router.patch("/customer/:id", protect(PERMISSIONS.VIEW_PRODUCT), invoiceController.updateInvoiceCustomer);
router.patch("/:id/items", protect(PERMISSIONS.VIEW_PRODUCT), invoiceController.updateInvoiceItems);
router.post("/:id/cancel", protect(PERMISSIONS.VIEW_PRODUCT), invoiceController.cancelInvoice);
router.get("/drafts", protect(PERMISSIONS.VIEW_PRODUCT), invoiceController.getDrafts);
router.get("/:id", protect(PERMISSIONS.VIEW_PRODUCT), invoiceController.getDetail);

module.exports = router;