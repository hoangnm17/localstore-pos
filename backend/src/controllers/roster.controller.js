const rosterModel = require("../models/roster.model");
const shiftModel = require("../models/shift.model");
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
                    staffId: row.staffId,
                    fullName: row.fullName,
                    roleName: row.roleName,
                    totalHours: 0,
                    schedules: {}
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
                        scheduleId: row.scheduleId,
                        shiftId: row.shiftId,
                        shiftName: row.shiftName,
                        startTime: row.startTime,
                        endTime: row.endTime,
                        status: row.status,
                        counterId: row.counterId,
                        counterName: row.counterName,
                        counterCode: row.counterCode,
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

module.exports.assignShift = async (req, res) => {
    try {
        const { staffId, shiftId, workDate } = req.body;

        if (!staffId || !shiftId || !workDate) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin phân công!" });
        }

        const today = new Date(Date.now() + 7 * 3600 * 1000).toISOString().split('T')[0];
        if (workDate < today) {
            return res.status(400).json({ success: false, message: "Không được phân công ca vào ngày trong quá khứ!" });
        }

        const existing = await rosterModel.checkExisting(staffId, shiftId, workDate);
        if (existing) {
            return res.status(400).json({ success: false, message: "Nhân viên đã được phân công ca này trong ngày!" });
        }

        const shiftInfo = await shiftModel.getShiftById(shiftId);
        if (!shiftInfo) {
            return res.status(404).json({ success: false, message: "Không tìm thấy ca làm việc!" });
        }

        const timeConflict = await rosterModel.checkTimeConflictForStaff(staffId, shiftId, workDate);
        if (timeConflict) {
            return res.status(400).json({
                success: false,
                message: `Nhân viên đã có ca "${timeConflict.shiftName}" (${timeConflict.startTime}–${timeConflict.endTime}) bị trùng giờ trong ngày này!`
            });
        }

        await rosterModel.assignShift(staffId, shiftId, workDate);
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

