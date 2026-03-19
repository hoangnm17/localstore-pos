const rosterModel = require("../models/roster.model");
const shiftModel  = require("../models/shift.model");

// Helper tính giờ từ "HH:MM"
const calcHours = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
};

// Helper lấy thứ 2 của tuần chứa ngày d
const getMonday = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
};

const getSunday = (dateStr) => {
    const monday = new Date(getMonday(dateStr));
    monday.setDate(monday.getDate() + 6);
    return monday.toISOString().split('T')[0];
};

module.exports.getWeeklySchedule = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Thiếu startDate hoặc endDate!" });
        }

        const records = await rosterModel.getWeeklySchedule(startDate, endDate);

        const staffMap = {};
        for (const row of records) {
            if (!staffMap[row.staffId]) {
                staffMap[row.staffId] = {
                    staffId:row.staffId,
                    fullName:row.fullName,
                    roleName:row.roleName,
                    totalHours:0,
                    schedules:{}
                };
            }
            if (row.scheduleId) {
                const dateKey = row.workDate
                    ? new Date(row.workDate).toISOString().split('T')[0]
                    : null;
                if (dateKey) {
                    if (!staffMap[row.staffId].schedules[dateKey]) {
                        staffMap[row.staffId].schedules[dateKey] = [];
                    }
                    staffMap[row.staffId].schedules[dateKey].push({
                        scheduleId:row.scheduleId,
                        shiftId:row.shiftId,
                        shiftName:row.shiftName,
                        startTime:row.startTime,
                        endTime:row.endTime,
                        status:row.status,
                        counterId:row.counterId,
                        counterName:row.counterName,
                        counterCode:row.counterCode,
                    });
                    staffMap[row.staffId].totalHours += Number(row.shiftHours) || 0;
                }
            }
        }

        return res.json({ success: true, data: Object.values(staffMap) });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
};

module.exports.getCounters = async (req, res) => {
    try {
        const data = await rosterModel.getCounters();
        return res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
};

module.exports.assignShift = async (req, res) => {
    try {
        const { staffId, shiftId, workDate, counterId } = req.body;

        if (!staffId || !shiftId || !workDate) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin phân công!" });
        }

        const today = new Date().toISOString().split('T')[0];
        if (workDate < today) {
            return res.status(400).json({
                success: false,
                message: "Không được phân công ca vào ngày trong quá khứ!"
            });
        }

        const existing = await rosterModel.checkExisting(staffId, shiftId, workDate);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Nhân viên đã được phân công ca này trong ngày!"
            });
        }

        const shiftInfo = await shiftModel.getShiftById(shiftId);
        if (!shiftInfo) {
            return res.status(404).json({ success: false, message: "Không tìm thấy ca làm việc!" });
        }
        const shiftHours = calcHours(shiftInfo.startTime, shiftInfo.endTime);

        const dailyHours = await rosterModel.getDailyHours(staffId, workDate);
        if (dailyHours + shiftHours > 10) {
            return res.status(400).json({
                success: false,
                message: `Nhân viên bị gán quá 10 giờ/ngày! (Hiện tại: ${dailyHours.toFixed(1)}h + ca mới: ${shiftHours.toFixed(1)}h = ${(dailyHours + shiftHours).toFixed(1)}h). Vi phạm quy tắc lao động!`
            });
        }

        const weekStart   = getMonday(workDate);
        const weekEnd     = getSunday(workDate);
        const weeklyHours = await rosterModel.getWeeklyHours(staffId, weekStart, weekEnd);
        if (weeklyHours + shiftHours > 48) {
            return res.status(400).json({
                success: false,
                message: `Nhân viên bị gán quá 48 giờ/tuần! (Hiện tại: ${weeklyHours.toFixed(1)}h + ca mới: ${shiftHours.toFixed(1)}h = ${(weeklyHours + shiftHours).toFixed(1)}h). Vi phạm quy tắc lao động!`
            });
        }

        if (counterId != null) {
            const conflict = await rosterModel.checkCounterConflict(counterId, shiftId, workDate);
            if (conflict) {
                return res.status(400).json({
                    success: false,
                    message: `Quầy này đã được phân công cho nhân viên "${conflict.fullName}" trong ca này!`
                });
            }
        }

        const counterIdToSave = counterId != null ? counterId : null;
        await rosterModel.assignShift(staffId, shiftId, workDate, counterIdToSave);
        return res.json({ success: true, message: "Phân công ca thành công!" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
};

module.exports.removeShift = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const schedule = await rosterModel.getScheduleById(scheduleId);
        
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lịch làm việc!" });
        }

        const nowVN = new Date(Date.now() + 7 * 3600 * 1000);
        const todayStr = nowVN.toISOString().split('T')[0];
        const currentTime = nowVN.toISOString().split('T')[1].substring(0, 5);

        const workDateStr = schedule.workDate.toISOString().split('T')[0];
        const shiftStartTime = schedule.snapshotStartTime || schedule.startTime;

        if (workDateStr < todayStr) {
            return res.status(400).json({ success: false, message: "Không được xóa ca trong quá khứ!" });
        }
        
        if (workDateStr === todayStr && currentTime >= shiftStartTime) {
            return res.status(400).json({ success: false, message: "Ca làm việc đã tới lúc bắt đầu, không thể xóa!" });
        }

        await rosterModel.removeShift(scheduleId);
        return res.json({ success: true, message: "Xóa phân công thành công!" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
};

