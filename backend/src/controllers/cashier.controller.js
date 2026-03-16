const cashierModel = require("../models/cashier.model");
const sql = require("mssql");
const { connectDB } = require("../config/database");

const getStaffByUserId = async (userId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
            SELECT s.id, s.fullName, s.salaryType, u.roleId 
            FROM Staff s
            JOIN Users u ON s.userId = u.id
            WHERE s.userId = @userId
        `);
    return result.recordset[0];
};
module.exports.getMySchedule = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user.id;

        const staff = await getStaffByUserId(userId);
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
        const userId = req.user.id;
        const staff = await getStaffByUserId(userId);

        const data = await cashierModel.getPendingHandovers(staff.id, workDate);
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports.getSystemCash = async (req, res) => {
    try {
        const { scheduleId } = req.query;
        const userId = req.user.id;
        const staff = await getStaffByUserId(userId);

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

        await cashierModel.createHandover({
            scheduleId,
            openingCash: parseFloat(openingCash),
            systemCash: parseFloat(systemCash),
            actualCash: parseFloat(actualCash),
            note
        });

        return res.json({ success: true, message: "Bàn giao tiền mặt thành công!" });
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
