const staffService = require("../services/staff.service");


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
        const roles = await staffService.getRoles();
        return res.json({ success: true, data: roles });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
module.exports.toggleStatus = async (req, res) => {
    try {
        const { id, isActive } = req.body;
        await staffService.toggleStatus(id, isActive);
        return res.status(200).json({
            success: true,
            message: `Tài khoản đã ${isActive === 'active' ? 'kích hoạt' : 'khóa'} thành công!`,
        });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

module.exports.resignStaff = async (req, res) => {
    try {
        const { id } = req.body;
        const staff = await staffService.resignStaff(id);
        return res.status(200).json({
            success: true,
            message: `Đã ghi nhận ${staff.fullName} nghỉ việc và khóa tài khoản!`
        });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

module.exports.createStaff = async (req, res) => {
    try {
        await staffService.createStaff(req.body); 
        
        return res.status(201).json({ success: true, message: "Tạo nhân viên thành công!" });
    } catch (err) {
        console.error("[createStaff ERROR]", err.message);
        return res.status(400).json({ success: false, message: err.message }); 
    }
};


module.exports.getDetail = async (req, res) => {
    try {
        const id = req.query.id;
        const staff = await staffService.getStaffDetail(id);
        return res.json({ success: true, data: staff });
    } catch (err) {
        return res.status(404).json({ success: false, message: err.message });
    }
};

module.exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.body;
        await staffService.updateStaff(id, req.body);
        return res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (err) {
        console.error("[updateStaff ERROR]", err.message);
        return res.status(400).json({ success: false, message: err.message });
    }
};

module.exports.resetPassword = async (req, res) => {
    try {
        const { userId } = req.body;
        await staffService.resetPassword(userId);
        return res.json({ 
            success: true,
             message: "Đã Reset mật khẩu của nhân viên về '123456'. Hãy nhắc người đó đổi mật khẩu khi đăng nhập." 
            });
    } catch (err) {
        return res.status(400).json({
             success: false, message: err.message 
            });
    }
};

module.exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await staffService.getMyProfile(userId);
        return res.json({ 
            success: true, data: profile });
    } catch (err) {
        return res.status(400).json({ 
            success: false, message: err.message });
    }
};

module.exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        await staffService.changePassword(userId, oldPassword, newPassword);
        return res.json({ 
            success: true, 
            message: "Đổi mật khẩu thành công. Tài khoản đã được bảo mật!" 
        });
    } catch (err) {
        return res.status(400).json({
             success: false, message: err.message 
            });
    }
};