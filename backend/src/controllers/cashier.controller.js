const cashierService = require("../services/cashier.service");

module.exports.getMySchedule = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const result = await cashierService.getMySchedule(req.user.id, startDate, endDate);
        return res.json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(err.message.includes("liên kết") ? 404 : 500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports.getPendingShifts = async (req, res) => {
    try {
        const { workDate } = req.query;
        const data = await cashierService.getPendingShifts(req.user.id, workDate);
        return res.json({
            success: true,
            data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports.getSystemCash = async (req, res) => {
    try {
        const { scheduleId } = req.query;
        const systemCash = await cashierService.getSystemCash(req.user.id, scheduleId);
        return res.json({
            success: true,
            data: {
                systemCash
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports.submitHandover = async (req, res) => {
    try {
        const result = await cashierService.submitHandover(req.user.id, req.body);
        return res.json({
            success: true,
            message: "Bàn giao tiền mặt thành công!",
            data: {
                penalty: result.penalty
            }
        });
    } catch (err) {
        const isClientError =
            err.message.includes("Thiếu thông tin") ||
            err.message.includes("Chưa hết giờ") ||
            err.message.includes("thâm hụt") ||
            err.message.includes("lý do") ||
            err.message.includes("Không tìm thấy");
        return res.status(isClientError ? 400 : 500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports.getHandoverReport = async (req, res) => {
    try {
        const result = await cashierService.getHandoverReport(req.query);
        return res.json({
            success: true,
            data: result.data,
            summary: result.summary,
            pagination: {
                page: Number(req.query.page || 1),
                pageSize: Number(req.query.pageSize || 10),
                totalItems: result.total,
                totalPages: Math.ceil(result.total / Number(req.query.pageSize || 10)),
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống: " + err.message
        });
    }
};

module.exports.getDailyAuditStatus = async (req, res) => {
    try {
        const { workDate } = req.query;
        if (!workDate) return res.status(400).json({
            success: false,
            message: "Thiếu ngày cần đối soát!"
        });

        const result = await cashierService.getDailyAuditStatus(workDate);
        return res.json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
