const salaryModel = require("../models/salary.model");


module.exports.getSalaryReport = async (req, res) => {
    try {
        const { month, year, staffId, role } = req.query;

        const m = parseInt(month);
        const y = parseInt(year);

        if (!month || !year) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp tháng và năm!" });
        }
        if (isNaN(m) || m < 1 || m > 12) {
            return res.status(400).json({ success: false, message: "Tháng không hợp lệ! (1-12)" });
        }
        if (isNaN(y) || y < 2020 || y > 2100) {
            return res.status(400).json({ success: false, message: "Năm không hợp lệ!" });
        }

        const staffIdNum = staffId ? parseInt(staffId) : null;
        if (staffId && isNaN(staffIdNum)) {
            return res.status(400).json({ success: false, message: "staffId không hợp lệ!" });
        }

        const roleName = role && role.trim() !== '' ? role.trim() : null;

        const data = await salaryModel.getSalaryReport(m, y, staffIdNum, roleName);

        const summary = {
            totalStaff: data.length,
            totalGross: data.reduce((acc, r) => acc + r.grossSalary, 0),
            totalNet: data.reduce((acc, r) => acc + r.netSalary, 0),
            totalDeductions: data.reduce((acc, r) => acc + r.deductions, 0),
        };

        return res.json({
            success: true,
            data,
            summary,
            meta: { month: m, year: y }
        });

    } catch (err) {
        console.error("salary.controller.getSalaryReport:", err);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
};



module.exports.getRoleList = async (req, res) => {
    try {
        const data = await salaryModel.getRoleList();
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


module.exports.getStaffList = async (req, res) => {
    try {
        const data = await salaryModel.getStaffList();
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
