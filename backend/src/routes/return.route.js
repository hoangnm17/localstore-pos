const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");
const returnController = require("../controllers/return.controller")

router.get("/", protect(PERMISSIONS.VIEW_RETURN), returnController.getReturns)
router.post("/", protect(PERMISSIONS.CREATE_RETURN), returnController.createReturn)
router.patch("/:id/approve", protect(PERMISSIONS.APPROVE_RETURN), returnController.approveReturn);
router.patch("/:id/reject", protect(PERMISSIONS.APPROVE_RETURN), returnController.rejectReturn);
router.patch("/:id/restock", protect(PERMISSIONS.ADJUST_STOCK), returnController.restockReturn);
router.get("/:id", protect(PERMISSIONS.VIEW_RETURN), returnController.getReturnDetail);

module.exports = router;