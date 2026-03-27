const attendanceService = require("../services/attendance.service");

module.exports.checkPending = async (req, res) => {
    try {
        const data = await attendanceService.checkPending(req.user.staffId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports.checkIn = async (req, res) => {
    try {
        const result = await attendanceService.checkIn(
            req.user.staffId,
            req.body.openingCash
        );
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports.simpleCheckOut = async (req, res) => {
    try {
        const { scheduleId } = req.body;
        if (!scheduleId) {
            return res.status(400).json({ success: false, message: "Thiếu scheduleId!" });
        }
        const result = await attendanceService.simpleCheckOut(
            req.user.staffId,
            scheduleId
        );
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports.checkWorking = async (req, res) => {
    try {
        const data = await attendanceService.checkWorking(req.user.staffId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(200).json({ success: true, data: null });
    }
};
