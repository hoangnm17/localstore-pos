const dashboardService = require('../services/dashboard.service');

exports.getSummary = async (req, res) => {
    try {
        const data = await dashboardService.getSummary();
        res.json({
            success: true,
            data: data
        });
    } catch (err) {
        console.error('Error fetching dashboard summary:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu tổng hợp Dashboard',
            error: err.message
        });
    }
};
