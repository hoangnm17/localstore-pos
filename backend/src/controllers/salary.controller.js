const salaryService = require("../services/salary.service");
const salaryModel = require("../models/salary.model");

module.exports.getSalaryReport = async (req, res) => {
    try {
        const { month, year, staffId, role } = req.query;
        if (!month || !year) return res.status(400).json({
            success: false,
            message: "Thiếu tháng/năm!"
        });

        const data = await salaryService.getSalaryReport(parseInt(month), parseInt(year), { staffId, roleName: role });
        const summary = {
            totalStaff: data.length,
            totalGross: data.reduce((acc, r) => acc + r.grossSalary, 0),
            totalNet: data.reduce((acc, r) => acc + r.netSalary, 0),
            totalDeductions: data.reduce((acc, r) => acc + r.deductions, 0),
        };

        return res.json({
            success: true,
            data,
            summary
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống: " + err.message
        });
    }
};

module.exports.getRoleList = async (req, res) => {
    try {
        const data = await salaryModel.getRoleList();
        return res.json({
            success: true,
            data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports.getPayrollStatus = async (req, res) => {
    try {
        const { month, year } = req.query;
        const status = await salaryModel.getPayrollStatus(parseInt(month), parseInt(year));
        return res.json({
            success: true,
            data: status
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports.confirmPayroll = async (req, res) => {
    try {
        const { month, year } = req.body;
        const result = await salaryService.confirmPayroll(parseInt(month), parseInt(year));
        return res.json({
            success: true,
            message: `Đã chốt lương cho ${result.confirmed} nhân viên!`,
            data: result
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
