const promotionModel = require('../models/promotion.model');

exports.getPromotionList = async (filters) => {
    const [data, total] = await Promise.all([
        promotionModel.getPromotions(filters),
        promotionModel.countPromotions(filters)
    ]);

    return {
        data,
        total,
        totalPages: Math.ceil(total / (filters.limit || 10))
    };
};

exports.getPromotionById = async (id) => {
    return await promotionModel.getPromotionById(id);
};

exports.createPromotion = async (data) => {
    const promotion = await promotionModel.createPromotion(data);

    // Thêm danh sách sản phẩm/danh mục áp dụng nếu có
    if (data.items && data.items.length > 0) {
        for (const item of data.items) {
            await promotionModel.addPromotionItem(promotion.id, item);
        }
    }

    // Trả về promotion kèm items vừa tạo
    return await promotionModel.getPromotionById(promotion.id);
};

exports.updatePromotion = async (id, data) => {
    const updated = await promotionModel.updatePromotion(id, data);
    if (!updated) return null;

    // Nếu client gửi lên danh sách items mới → replace toàn bộ
    if (data.items !== undefined) {
        await promotionModel.clearPromotionItems(id);
        for (const item of data.items) {
            await promotionModel.addPromotionItem(id, item);
        }
    }

    return await promotionModel.getPromotionById(id);
};

exports.deletePromotion = async (id) => {
    return await promotionModel.deletePromotion(id);
};

exports.removePromotionItem = async (itemId) => {
    return await promotionModel.removePromotionItem(itemId);
};
