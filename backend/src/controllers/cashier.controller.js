const cashierModel = require("../models/cashier.model");
const sql = require("mssql");
const staffModel = require("../models/staff.model");
module.exports.getMySchedule = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const staff = await staffModel.getStaffByUserId(req.user.id);
        if (!staff) return res.status(404).json({ success: false, message: "Tài khoản chưa liên kết nhân viên!" });

        const schedules = await cashierModel.getMySchedule(staff.id, startDate, endDate);

        return res.json({ success: true, data: { staff, schedules } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports.getPendingShifts = async (req, res) => {
    try {
        const { workDate } = req.query;
        const staff = await staffModel.getStaffByUserId(req.user.id);

        const data = await cashierModel.getPendingHandovers(staff.id, workDate);
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports.getSystemCash = async (req, res) => {
    try {
        const { scheduleId } = req.query;
        const staff = await staffModel.getStaffByUserId(req.user.id);

        const systemCash = await cashierModel.getSystemCash(staff.id, scheduleId);
        return res.json({ success: true, data: { systemCash } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports.submitHandover = async (req, res) => {
    try {
        const { scheduleId, openingCash, systemCash, actualCash, note } = req.body;
        if (!scheduleId || actualCash == null || openingCash == null) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin kết ca!" });
        }

        const expectedTotal = parseFloat(openingCash) + parseFloat(systemCash || 0);
        if (parseFloat(actualCash) < expectedTotal && (!note || note.trim() === '')) {
            return res.status(400).json({ success: false, message: "Vui lòng ghi lý do thất thoát!" });
        }

        const scheduleTimes = await cashierModel.getScheduleTimes(scheduleId);
        if (!scheduleTimes) {
            return res.status(404).json({ success: false, message: "Không tìm thấy dữ liệu ca làm việc này!" });
        }

        const { dateStr, startStr, endStr, deadlineStr } = scheduleTimes;
        const now = new Date();
        const startDT = new Date(`${dateStr}T${startStr}:00`);
        const endDT = new Date(`${dateStr}T${endStr}:00`);
        const deadlineDT = new Date(`${dateStr}T${deadlineStr}:00`);

        if (endDT < new Date(`${dateStr}T00:00:00`)) {
            endDT.setDate(endDT.getDate() + 1);
            deadlineDT.setDate(deadlineDT.getDate() + 1);
        }

        if (now < endDT) {
            return res.status(400).json({ success: false, message: "Chưa hết giờ làm, không thể kết ca!" });
        }

        const result = await cashierModel.createHandover({
            scheduleId,
            openingCash: parseFloat(openingCash),
            systemCash: parseFloat(systemCash),
            actualCash: parseFloat(actualCash),
            note
        });

        return res.json({ success: true, message: "Bàn giao tiền mặt thành công!", data: { penalty: result.penalty } });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Lỗi kết ca: " + err.message });
    }
};


module.exports.getHandoverReport = async (req, res) => {
    try {
        const {
            fromDate, toDate,
            counterId, role,
            staffName, shiftName,
            page = 1, pageSize = 10
        } = req.query;

        const result = await cashierModel.getHandoverReport({
            fromDate: fromDate || null,
            toDate: toDate || null,
            counterId: counterId ? Number(counterId) : null,
            role: role || null,
            staffName: staffName || null,
            shiftName: shiftName || null,
            page: Math.max(1, Number(page)),
            pageSize: Math.min(50, Math.max(1, Number(pageSize))),
        });

        return res.json({
            success: true,
            data: result.data,
            summary: result.summary,
            pagination: {
                page: Number(page),
                pageSize: Number(pageSize),
                totalItems: result.total,
                totalPages: Math.ceil(result.total / Number(pageSize)),
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống: " + err.message });
    }
};
