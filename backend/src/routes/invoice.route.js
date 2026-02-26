const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");

const invoiceController = require("../controllers/invoice.controller")

router.get("/", invoiceController.getAllInvoice)
router.post("/", invoiceController.createInvoice);
router.patch("/:id", invoiceController.updateInvoice);
router.get("/drafts", invoiceController.getDrafts);
router.get("/:id", invoiceController.getDetail);

module.exports = router