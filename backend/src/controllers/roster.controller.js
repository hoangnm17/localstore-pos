const rosterService = require("../services/roster.service");
module.exports.getWeeklySchedule = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Thiếu startDate hoặc endDate!"
            });
        }

        const data = await rosterService.getWeekSchedule(startDate, endDate);
        return res.json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống: " + err.message
        });
    }
};

module.exports.assignShift = async (req, res) => {
    try {
        const { staffId, shiftId, workDate } = req.body;
        if (!staffId || !shiftId || !workDate) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin phân công!"
            });
        }

        await rosterService.assignShift({ staffId, shiftId, workDate });
        return res.json({
            success: true,
            message: "Phân công ca thành công!"
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

module.exports.removeShift = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        await rosterService.deleteShift(scheduleId);
        return res.json({
            success: true,
            message: "Xóa phân công thành công!"
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            success: false
            , message: err.message
        });
    }
};
module.exports.clearSchedule = async (req, res) => {
    try {
        const { staffId, startDate, endDate } = req.body;
        const result = await rosterService.clearShifts({ staffId, startDate, endDate });
        return res.json({
            success: true,
            message: `Đã xóa ${result.deletedCount} ca làm việc hợp lệ!`,
            data: result
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ success: false, message: err.message });
    }
};
