const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");

router.get("/", protect(PERMISSIONS.VIEW_PRODUCT), invoiceController.getAllInvoice)


module.exports = router;