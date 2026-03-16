const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/helperPermission.middleware");
const PERMISSIONS = require("../constants/permissions");
const returnItemController = require("../controllers/returnItem.controller")

router.get("/", protect(PERMISSIONS.VIEW_PRODUCT), returnItemController.getReturnItems);
router.patch("/restock/:id/approve", protect(PERMISSIONS.VIEW_PRODUCT), returnItemController.approveRestock);
router.patch("/restock/:id/reject", protect(PERMISSIONS.VIEW_PRODUCT), returnItemController.rejectRestock);

module.exports = router;