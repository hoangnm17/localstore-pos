const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");

router.post("/:id/pay-cash", protect(PERMISSIONS.VIEW_PRODUCT), paymentController.payCash);
router.post("/create-qr", paymentController.createQR);
router.post("/webhook", paymentController.webhook);

module.exports = router;