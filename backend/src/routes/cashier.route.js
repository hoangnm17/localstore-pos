const express = require("express");
const router = express.Router();
const cashierController = require("../controllers/cashier.controller");
const { protect } = require("../middlewares/protect.middleware");
const PERMISSIONS = require("../constants/permissions");

router.get("/my-schedule", protect(PERMISSIONS.VIEW_MY_SCHEDULE), cashierController.getMySchedule);

router.get("/handover/pending", protect(PERMISSIONS.CREATE_CASH_HANDOVER), cashierController.getPendingShifts);
router.get("/handover/system-cash", protect(PERMISSIONS.CREATE_CASH_HANDOVER), cashierController.getSystemCash);
router.post("/handover", protect(PERMISSIONS.CREATE_CASH_HANDOVER), cashierController.submitHandover);
router.get("/handover/report", protect(PERMISSIONS.VIEW_HANDOVER_REPORT), cashierController.getHandoverReport);
router.get("/daily-audit", protect(PERMISSIONS.VIEW_HANDOVER_REPORT), cashierController.getDailyAuditStatus);
module.exports = router;