const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salary.controller");
const { protect } = require("../middlewares/protect.middleware");
const PERMISSIONS = require("../constants/permissions");

router.get("/", protect(PERMISSIONS.VIEW_SALARY_REPORT), salaryController.getSalaryReport);
router.get("/roles", protect(PERMISSIONS.VIEW_SALARY_REPORT), salaryController.getRoleList);
router.get("/payroll-status", protect(PERMISSIONS.VIEW_SALARY_REPORT), salaryController.getPayrollStatus);
router.post("/confirm", protect(PERMISSIONS.VIEW_SALARY_REPORT), salaryController.confirmPayroll);
module.exports = router;
