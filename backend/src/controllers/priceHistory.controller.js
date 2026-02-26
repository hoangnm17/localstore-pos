const priceHistoryService = require('../services/product/priceHistory.service');

exports.getByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = await priceHistoryService.getLatestByProductId(productId);
        if (!data) {
            return res.status(404).json({ success: false, message: 'No price history found' });
        }
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
