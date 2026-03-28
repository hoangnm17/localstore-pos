const cashierModel = require("../models/cashier.model");
const staffModel = require("../models/staff.model");

module.exports.getMySchedule = async (userId, startDate, endDate) => {
    const staff = await staffModel.getStaffByUserId(userId);
    if (!staff) throw new Error("Nhân viên không tồn tại!");
    const schedules = await cashierModel.getMySchedule(staff.id, startDate, endDate);
    return { staff, schedules };
};

module.exports.getPendingShifts = async (userId, workDate) => {
    const staff = await staffModel.getStaffByUserId(userId);
    if (!staff) throw new Error("Nhân viên không tồn tại!");
    return await cashierModel.getPendingHandovers(staff.id, workDate);
};

module.exports.getSystemCash = async (userId, scheduleId) => {
    const staff = await staffModel.getStaffByUserId(userId);
    if (!staff) throw new Error("Nhân viên không tồn tại!");
    return await cashierModel.getSystemCash(staff.id, scheduleId);
};

module.exports.submitHandover = async (userId, data) => {
    const staff = await staffModel.getStaffByUserId(userId);
    if (!staff) throw new Error("Nhân viên không tồn tại!");

    const { scheduleId, actualCash, note } = data;
    if (!scheduleId || actualCash === undefined) throw new Error("Thiếu thông tin bàn giao!");

    const systemCashInfo = await cashierModel.getSystemCash(staff.id, scheduleId);

    return await cashierModel.createHandoverSimple({
        scheduleId,
        openingCash: systemCashInfo.openingCash,
        systemCash: systemCashInfo.netSystemCash,
        actualCash,
        note,
        updatedRecord: data.updatedRecord || '',
        updatedPenalty: data.updatedPenalty || 0
    });
};

module.exports.getHandoverReport = async (filters) => {
    return await cashierModel.getHandoverReport(filters);
};

module.exports.getDailyAuditStatus = async (workDate) => {
    return await cashierModel.getDailyAuditStatus(workDate);
};
