const staffService = require("../services/staff.service");
const staffModel   = require("../models/staff.model");
const bcrypt       = require("bcryptjs");

module.exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await staffService.getStaffList();
        return res.status(200).json({ success: true, data: staffList });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
};
module.exports.getRoles = async (req, res) => {
    try {
        const roles = await staffModel.getAllRoles();
        return res.json({ success: true, data: roles });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
module.exports.toggleStatus = async (req, res) => {
    try {
        const { id, isActive } = req.body;
        const staff = await staffModel.getStaffById(id);
        if (!staff) return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên!" });
        await staffModel.updateStatus(staff.userId, isActive);
        return res.status(200).json({
            success: true,
            message: `Tài khoản đã ${isActive === 'active' ? 'kích hoạt' : 'khóa'} thành công!`,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports.resignStaff = async (req, res) => {
    try {
        const { id } = req.body;
        const staff = await staffModel.getStaffById(id);
        if (!staff) return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên!" });
        if (staff.employmentStatus === 'resigned') {
            return res.status(400).json({ success: false, message: "Nhân viên này đã nghỉ việc rồi!" });
        }
        await staffModel.atomicResign(id);
        return res.status(200).json({
            success: true,
            message: `Đã ghi nhận ${staff.fullName} nghỉ việc và khóa tài khoản!`
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Lỗi khi xử lý nghỉ việc: " + err.message });
    }
};

module.exports.createStaff = async (req, res) => {
    try {
        const {
            fullName, email, username, phoneNumber,
            roleId, salaryType, baseSalary,
            isActive, password, createdAt
        } = req.body;

        if (!username || !fullName || !phoneNumber || !roleId || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc!" });
        }
        const checkUser = await staffModel.getUserByUsername(username);
        if (checkUser) return res.status(400).json({ success: false, message: "Tên đăng nhập này đã tồn tại!" });
        if (email) {
            const checkEmail = await staffModel.getStaffByEmail(email);
            if (checkEmail) return res.status(400).json({ success: false, message: "Email liên lạc này đã được nhân viên khác sử dụng!" });
        }
        const checkPhone = await staffModel.getStaffByPhone(phoneNumber);
        if (checkPhone) return res.status(400).json({ success: false, message: "Số điện thoại này đã được nhân viên khác sử dụng!" });

        const checkName = await staffModel.getStaffByFullName(fullName);
        if (checkName) return res.status(400).json({ success: false, message: "Họ tên này đã tồn tại trong hệ thống!" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await staffModel.create({
            fullName, email: email || '', username, phoneNumber,
            roleId, salaryType: salaryType || 'hourly',
            baseSalary: baseSalary || 0,
            status: isActive || 'active',
            hashedPassword,
            createdAt: createdAt || new Date().toISOString()
        });

        return res.status(201).json({ success: true, message: "Tạo nhân viên thành công!" });
    } catch (err) {
        console.error("[createStaff ERROR]", err.message);
        return res.status(500).json({ success: false, message: "Lỗi tạo nhân viên: " + err.message });
    }
};

module.exports.getDetail = async (req, res) => {
    try {
        const id = req.query.id;
        const staff = await staffModel.getStaffById(id);
        if (!staff) return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên!" });
        return res.json({ success: true, data: staff });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports.updateStaff = async (req, res) => {
    try {
        const {
            id, phoneNumber, fullName, username, email,
            roleId, salaryType, baseSalary, isActive, newPassword, createdAt
        } = req.body;

        const staffId = parseInt(id);
        await staffModel.update(staffId, {
            fullName, email: email || '', phoneNumber,
            username, roleId,
            salaryType: salaryType || 'hourly',
            baseSalary: baseSalary || 0,
            isActive: isActive || 'active',
            newPassword: newPassword || '',
            createdAt
        });

        return res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (err) {
        console.error("[updateStaff ERROR]", err.message);
        return res.status(500).json({ success: false, message: "Lỗi cập nhật: " + err.message });
    }
};
