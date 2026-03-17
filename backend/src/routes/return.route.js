const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");
const returnController = require("../controllers/return.controller")

router.get("/", protect(PERMISSIONS.VIEW_PRODUCT), returnController.getReturns)
router.post("/", protect(PERMISSIONS.VIEW_PRODUCT), returnController.createReturn)
router.patch("/:id/approve", protect(PERMISSIONS.VIEW_PRODUCT), returnController.approveReturn);
router.patch("/:id/reject", protect(PERMISSIONS.VIEW_PRODUCT), returnController.rejectReturn);
router.patch("/:id/restock", returnController.restockReturn);
router.get("/:id", returnController.getReturnDetail);

module.exports = router;