const express = require("express")
const router = express.Router()

const invoiceController = require("../controllers/invoice.controller")

router.get("/", invoiceController.getAllInvoice)


module.exports = router