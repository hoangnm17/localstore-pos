const express = require("express")
const router = express.Router()

const invoiceController = require("../controllers/invoice.controller")

router.get("/", invoiceController.getAllInvoice)
router.post("/", invoiceController.createInvoice)

module.exports = router