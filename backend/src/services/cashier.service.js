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

    const now = new Date();
    const nowStr = now.getHours().toString().padStart(2, '0') + ':' +
        now.getMinutes().toString().padStart(2, '0');

    let finalRecord = systemCashInfo.currentRecord || 'OnTime';
    let finalPenalty = systemCashInfo.currentPenalty || 0;

    if (systemCashInfo.endTimeStr) {
        const start = systemCashInfo.startTimeStr;
        const end = systemCashInfo.endTimeStr;
        let isBeforeEnd = false;

        if (end > start) {
            isBeforeEnd = nowStr < end;
        } else {
            isBeforeEnd = (nowStr >= start) || (nowStr < end);
        }

        if (isBeforeEnd) {
            throw new Error(`Bạn chưa hết giờ làm (Kết thúc lúc ${end}). Chưa thể bàn giao!`);
        }
    }

    let isLateHandover = false;
    if (systemCashInfo.logoutDeadlineStr) {
        const start = systemCashInfo.startTimeStr;
        const end = systemCashInfo.endTimeStr;
        const deadline = systemCashInfo.logoutDeadlineStr;
        const isCrossMidnight = end < start;

        if (!isCrossMidnight) {
            isLateHandover = nowStr > deadline;
        } else {
            isLateHandover = (nowStr < start) && (nowStr > deadline);
        }

        if (isLateHandover) {
            finalRecord = finalRecord === 'OnTime' ? `LateHandover[${nowStr}]` : `${finalRecord}, LateHandover[${nowStr}]`;
            finalPenalty += 10000;
        }
    }

    const result = await cashierModel.createHandoverSimple({
        scheduleId,
        openingCash: systemCashInfo.openingCash,
        systemCash: systemCashInfo.netSystemCash,
        actualCash,
        note,
        updatedRecord: finalRecord,
        updatedPenalty: finalPenalty
    });

    return { ...result, penalty: isLateHandover ? 10000 : 0 };
};

module.exports.getHandoverReport = async (filters) => {
    return await cashierModel.getHandoverReport(filters);
};

module.exports.getDailyAuditStatus = async (workDate) => {
    return await cashierModel.getDailyAuditStatus(workDate);
};
