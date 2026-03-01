const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salary.controller");
const { protect } = require("../middlewares/protect.middleware");
const PERMISSIONS = require("../constants/permissions");

router.get(
    "/",
    protect(PERMISSIONS.VIEW_SALARY_REPORT),
    salaryController.getSalaryReport
);

router.get(
    "/roles",
    protect(PERMISSIONS.VIEW_SALARY_REPORT),
    salaryController.getRoleList
);

router.get(
    "/staff-list",
    protect(PERMISSIONS.VIEW_SALARY_REPORT),
    salaryController.getStaffList
);

module.exports = router;
