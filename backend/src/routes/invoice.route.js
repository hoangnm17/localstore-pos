const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");
const invoiceController = require("../controllers/invoice.controller")

router.get("/", protect(PERMISSIONS.VIEW_PRODUCT), invoiceController.getAllInvoice)
router.post("/", protect(PERMISSIONS.SELL_POS), invoiceController.createInvoice);
router.patch("/customer/:id", protect(PERMISSIONS.SELL_POS), invoiceController.updateInvoiceCustomer);
router.patch("/:id/items", protect(PERMISSIONS.SELL_POS), invoiceController.updateInvoiceItems);
router.post("/:id/cancel", protect(PERMISSIONS.SELL_POS), invoiceController.cancelInvoice);
router.get("/drafts", protect(PERMISSIONS.SELL_POS), invoiceController.getDrafts);
router.get("/:id", protect(PERMISSIONS.SELL_POS), invoiceController.getDetail);

module.exports = router;