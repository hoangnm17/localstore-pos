const express = require("express");
const router = express.Router();
const rosterController = require("../controllers/roster.controller");
const { protect } = require("../middlewares/protect.middleware");
const PERMISSIONS = require("../constants/permissions");

router.get("/",protect(PERMISSIONS.VIEW_SCHEDULE),   rosterController.getWeeklySchedule);
router.post("/",protect(PERMISSIONS.CREATE_SCHEDULE), rosterController.assignShift);
router.delete("/:scheduleId", protect(PERMISSIONS.DELETE_SCHEDULE), rosterController.removeShift);

module.exports = router;
