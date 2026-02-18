const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

router.post("/create", paymentController.createPayment);
router.get("/return", paymentController.vnpayReturn);

module.exports = router;
