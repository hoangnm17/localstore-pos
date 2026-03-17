const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shift.controller");
const { protect } = require("../middlewares/protect.middleware");
const PERMISSIONS = require("../constants/permissions");

router.get("/", protect(PERMISSIONS.VIEW_SHIFT), shiftController.getAllShifts);
router.get("/:id", protect(PERMISSIONS.VIEW_SHIFT), shiftController.getShiftById);
router.post("/", protect(PERMISSIONS.CREATE_SHIFT), shiftController.createShift);
router.put("/:id", protect(PERMISSIONS.UPDATE_SHIFT), shiftController.updateShift);
router.patch("/:id/toggle", protect(PERMISSIONS.UPDATE_SHIFT), shiftController.toggleShift);

module.exports = router;