const priceHistoryService = require('../services/product/priceHistory.service');

exports.getByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = await priceHistoryService.getLatestByProductId(productId);

        if (!data.latestSalePriceHistory && !data.latestCostPriceHistory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch sử giá'
            });
        }

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = await priceHistoryService.getAllByProductId(productId);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};