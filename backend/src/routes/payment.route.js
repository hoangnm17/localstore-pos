const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const PERMISSIONS = require("../constants/permissions");
const { protect } = require("../middlewares/helperPermission.middleware")

router.post("/create", protect(PERMISSIONS.VIEW_DASHBOARD) ,paymentController.createPayment);
router.get("/return", paymentController.vnpayReturn);

module.exports = router;
