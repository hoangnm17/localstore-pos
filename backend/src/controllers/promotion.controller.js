const promotionService = require('../services/promotion.service');

exports.getPromotions = async (req, res) => {
    try {
        const {
            search = '',
            status,
            type,
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Math.max(parseInt(page), 1);
        const pageSize = Math.max(parseInt(limit), 1);
        const offset = (pageNumber - 1) * pageSize;

        const result = await promotionService.getPromotionList({
            search,
            status,
            type,
            limit: pageSize,
            offset
        });

        res.json({
            success: true,
            page: pageNumber,
            limit: pageSize,
            ...result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getPromotionById = async (req, res) => {
    try {
        const promotion = await promotionService.getPromotionById(req.params.id);
        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }
        res.json({ success: true, data: promotion });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createPromotion = async (req, res) => {
    try {
        const promotion = await promotionService.createPromotion(req.body);
        res.status(201).json({ success: true, data: promotion });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
