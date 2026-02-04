const promotionModel = require('../models/promotion.model');

exports.getPromotionList = async (filters) => {
    // Assuming simple list for now, counting if needed later can be added to model
    const data = await promotionModel.getPromotions(filters);
    // You might want to implement countPromotions in model if pagination is strict
    return { data };
};

exports.getPromotionById = async (id) => {
    return await promotionModel.getPromotionById(id);
};

exports.createPromotion = async (data) => {
    const promotion = await promotionModel.createPromotion(data);
    if (data.items && data.items.length > 0) {
        for (const item of data.items) {
            await promotionModel.addPromotionItem(promotion.id, item);
        }
    }
    return promotion;
};
