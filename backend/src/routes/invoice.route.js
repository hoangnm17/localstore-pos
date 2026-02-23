const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");

const invoiceController = require("../controllers/invoice.controller")

router.get("/", protect(PERMISSIONS.VIEW_INVOICE), invoiceController.getAllInvoice)
// router.put("/:id/sync", )
router.post("/create", protect(PERMISSIONS.CREATE_INVOICE), invoiceController.createInvoice)

module.exports = router