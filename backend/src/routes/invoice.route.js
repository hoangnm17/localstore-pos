const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");
const invoiceController = require("../controllers/invoice.controller")

router.get("/", protect(PERMISSIONS.VIEW_INVOICE), invoiceController.getAllInvoice)
router.post("/", protect(PERMISSIONS.CREATE_INVOICE), invoiceController.createInvoice);
router.patch("/customer/:id", protect(PERMISSIONS.CREATE_INVOICE), invoiceController.updateInvoiceCustomer);
router.patch("/:id/items", protect(PERMISSIONS.CREATE_INVOICE), invoiceController.updateInvoiceItems);
router.post("/:id/cancel", protect(PERMISSIONS.DELETE_INVOICE), invoiceController.cancelInvoice);
router.get("/drafts", protect(PERMISSIONS.VIEW_INVOICE), invoiceController.getDrafts);
router.get("/:id", protect(PERMISSIONS.VIEW_INVOICE), invoiceController.getDetail);

module.exports = router;