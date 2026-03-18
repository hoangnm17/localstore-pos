const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");

router.post("/:id/pay-cash", protect(PERMISSIONS.SELL_POS), paymentController.payCash);
router.post("/create-qr", protect(PERMISSIONS.SELL_POS), paymentController.createQR);
router.post("/:invoiceId/cancel", protect(PERMISSIONS.SELL_POS), paymentController.cancelPendingPayment);
router.post("/webhook", paymentController.webhook);

module.exports = router;