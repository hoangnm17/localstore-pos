const reportService = require("../services/InventoryServices/report.service.js");

const getMonthlyReport = async (req, res) => {
    try {
        let { month, year, supplierId } = req.query;

        const now = new Date();

        if (!month) month = now.getMonth() + 1;
        if (!year) year = now.getFullYear();

        const result = await reportService.getMonthlyReport({
            month: parseInt(month),
            year: parseInt(year),
            supplierId: supplierId ? parseInt(supplierId) : null
        });

        return res.status(200).json({
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

module.exports = {
    getMonthlyReport
};