const staffModel = require("../models/staff.model");
const bcrypt = require("bcryptjs");

module.exports.getStaffList = async () => {
    return await staffModel.getAllStaff();
};

module.exports.getRoles = async () => {
    return await staffModel.getAllRoles();
};

module.exports.getStaffDetail = async (id) => {
    const staff = await staffModel.getStaffById(id);
    if (!staff) throw new Error("Không tìm thấy nhân viên!");
    return staff;
};

module.exports.toggleStatus = async (id, isActive) => {
    const staff = await staffModel.getStaffById(id);
    if (!staff) throw new Error("Không tìm thấy nhân viên!");
        await staffModel.updateStatus(staff.userId, isActive);
    return true;
};

module.exports.resignStaff = async (id) => {
    const staff = await staffModel.getStaffById(id);
    if (!staff) throw new Error("Không tìm thấy nhân viên!");
    if (staff.employmentStatus === 'resigned') {
        throw new Error("Nhân viên này đã nghỉ việc rồi!");
    }
    
    await staffModel.atomicResign(id);
    return staff;
}

module.exports.createStaff = async (data) => {
    const { username, email, phoneNumber, fullName, password, roleId } = data;

    if (!username || !fullName || !phoneNumber || !roleId || !password) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }

    const checkUser = await staffModel.getUserByUsername(username);
    if (checkUser) throw new Error("Tên đăng nhập này đã tồn tại!");

    if (email) {
        const checkEmail = await staffModel.getStaffByEmail(email);
        if (checkEmail) throw new Error("Email liên lạc này đã được nhân viên khác sử dụng!");
    }

    const checkPhone = await staffModel.getStaffByPhone(phoneNumber);
    if (checkPhone) throw new Error("Số điện thoại này đã được nhân viên khác sử dụng!");

    const hashedPassword = await bcrypt.hash(password, 10);

    await staffModel.create({
        ...data,
        email:email || '',
        salaryType:data.salaryType || 'hourly',
        baseSalary:data.baseSalary || 0,
        status:data.isActive || 'active',
        hashedPassword,
        createdAt:data.createdAt || new Date().toISOString()
    });
};

module.exports.updateStaff = async (id, data) => {
    if (data.username) {
        const checkUser = await staffModel.getStaffByUsernameForUpdate(data.username, id);
        if (checkUser) throw new Error("Tên đăng nhập này đã có chủ, vui lòng chọn tên khác!");
    }

    if (data.phoneNumber) {
        const checkPhone = await staffModel.getStaffByPhoneForUpdate(data.phoneNumber, id);
        if (checkPhone) throw new Error("Số điện thoại này đã được nhân viên khác sử dụng!");
    }

    if (data.email) {
        const checkEmail = await staffModel.getStaffByEmailForUpdate(data.email, id);
        if (checkEmail) throw new Error("Email này đã được nhân viên khác sử dụng!");
    }

    let hashedPassword = null;
    if (data.newPassword && data.newPassword.trim() !== "") {
        hashedPassword = await bcrypt.hash(data.newPassword, 10);
    }

    await staffModel.update(id, {
        ...data,
        email: data.email || '',
        salaryType: data.salaryType || 'hourly',
        baseSalary: data.baseSalary || 0,
        isActive: data.isActive || 'active',
        hashedPassword 
    });
};
