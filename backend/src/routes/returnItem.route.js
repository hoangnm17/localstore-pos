const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");
const returnItemController = require("../controllers/returnItem.controller")

router.get("/", protect(PERMISSIONS.ADJUST_STOCK), returnItemController.getReturnItems);
router.patch("/restock/:id/approve", protect(PERMISSIONS.ADJUST_STOCK), returnItemController.approveRestock);
router.patch("/restock/:id/reject", protect(PERMISSIONS.ADJUST_STOCK), returnItemController.rejectRestock);

module.exports = router;