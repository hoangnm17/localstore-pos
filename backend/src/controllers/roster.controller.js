const rosterModel = require("../models/roster.model");

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
                        status: row.status
                    });
                    staffMap[row.staffId].totalHours += Number(row.shiftHours) || 0;
                }
            }
        }

        return res.json({
            success: true,
            data: Object.values(staffMap)
        });
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

        const existing = await rosterModel.checkExisting(staffId, shiftId, workDate);
        if (existing) {
            return res.status(400).json({ success: false, message: "Nhân viên đã được phân công ca này trong ngày!" });
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
        await rosterModel.removeShift(scheduleId);
        return res.json({ success: true, message: "Xóa phân công thành công!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
};
