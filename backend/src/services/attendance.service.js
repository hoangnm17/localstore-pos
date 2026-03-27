const attendanceModel = require("../models/attendance.model");

module.exports.checkPending = async (staffId) => {
    const roleName = await attendanceModel.getStaffRoleName(staffId);

    if (roleName === 'Manager') return null;

    if (roleName === 'Warehouse') {
        await attendanceModel.autoAssignWarehouse(staffId);
    }

    const schedule = await attendanceModel.getPendingSchedule(staffId);
    if (!schedule) return null;

    const needsCash = ['Cashier'].includes(schedule.roleName);
    return { ...schedule, needsCash };
};

module.exports.checkIn = async (staffId, openingCash) => {
    const schedule = await attendanceModel.getPendingSchedule(staffId);
    if (!schedule) throw new Error("Không tìm thấy ca chờ nhận hôm nay!");

    const role = schedule.roleName;
    const isWarehouse = role === 'Warehouse';

    let record = 'OnTime';
    let penalty = 0;

    const nowStr = new Date(Date.now() + 7 * 3600 * 1000)
        .toISOString().split('T')[1].substring(0, 5);
    const limitStr = schedule.checkInEnd || schedule.startTime;

    if (role === 'Cashier' || role === 'Warehouse') {
        if (nowStr > limitStr) {
            record = `LateIn[${nowStr}]`;
            penalty = 50000;
        }
    }

    const needsCash = ['Cashier'].includes(role);
    if (needsCash && openingCash === undefined) {
        throw new Error("Vui lòng đếm két và nhập số tiền đầu ca!");
    }

    await attendanceModel.processCheckIn(
        schedule.scheduleId,
        openingCash,
        needsCash,
        record,
        penalty
    );
    return { record, penalty, message: "Nhận ca thành công!" };
};

module.exports.simpleCheckOut = async (staffId, scheduleId) => {
    const schedule = await attendanceModel.getWorkingScheduleById(scheduleId, staffId);
    if (!schedule) throw new Error("Không tìm thấy ca đang làm của bạn!");
    if (schedule.roleName !== 'Warehouse') {
        throw new Error("Chỉ nhân viên kho mới được dùng chức năng này!");
    }

    const nowStr = new Date(Date.now() + 7 * 3600 * 1000)
        .toISOString().split('T')[1].substring(0, 5);

    let record = 'OnTime';
    let penalty = 0;

    if (nowStr < schedule.endTime) {
        throw new Error("Chưa hết giờ làm, không thể kết ca!");
    }

    await attendanceModel.processSimpleCheckOut(scheduleId, record, penalty);
    return { record, penalty, message: "Tan ca thành công!" };
};

module.exports.checkWorking = async (staffId) => {
    return await attendanceModel.checkWorking(staffId);
};
