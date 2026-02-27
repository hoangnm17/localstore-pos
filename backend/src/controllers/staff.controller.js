const staffService = require("../services/staff.service");
const staffModel = require("../models/staff.model");
const bcrypt = require("bcryptjs");
module.exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await staffService.getStaffList();
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách nhân viên thành công",
            data: staffList
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống: " + err.message
        });
    }
};

module.exports.toggleStatus = async (req, res) => {
    try {
        const { id, isActive } = req.body;

        const staff = await staffModel.getStaffById(id);
        if (!staff) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên!" });
        }
        await staffModel.updateStatus(staff.userId, isActive);
        return res.status(200).json({
            success: true,
            message: `Tài khoản đã được ${isActive === 'active' ? 'kích hoạt' : 'khóa'} thành công!`,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports.createStaff = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, roleId, salaryType, baseSalary, isActive, password, createdAt } = req.body;

        const checkUser = await staffModel.getUserByUsername(email);
        if (checkUser) return res.status(400).json({ success: false, message: "Email/Tên đăng nhập này đã tồn tại!" });

        const checkPhone = await staffModel.getStaffByPhone(phoneNumber);
        if (checkPhone) return res.status(400).json({ success: false, message: "Số điện thoại này đã được nhân viên khác sử dụng!" });

        const checkName = await staffModel.getStaffByFullName(fullName);
        if (checkName) return res.status(400).json({ success: false, message: "Họ tên này đã tồn tại trong hệ thống!" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await staffModel.create({
            fullName, email, phoneNumber, roleId, salaryType,
            baseSalary, status: isActive, hashedPassword, createdAt
        });

        res.json({ success: true, message: "Thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi hệ thống không xác định!" });
    }
};
module.exports.getDetail = async (req, res) => {
    try {
        const id = req.query.id;
        const staff = await staffModel.getStaffById(id);
        res.json({ success: true, data: staff });
    } catch (err) { res.status(500).json({ success: false }); }
};

module.exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.body;
        await staffModel.update(id, req.body);
        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
