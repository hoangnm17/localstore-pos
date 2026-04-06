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
    if (data.items && data.items.length > 0) {
        for (const item of data.items) {
            await promotionModel.addPromotionItem(promotion.id, item);
        }
    }
    return await promotionModel.getPromotionById(promotion.id);
};

exports.updatePromotion = async (id, data) => {
    const existing = await promotionModel.getPromotionById(id);
    if (!existing) return null;


    if (data.items !== undefined && existing.status !== 'Active') {
        throw new Error('Không thể thêm sản phẩm vào promotion đã bị vô hiệu hóa');
    }

    const updated = await promotionModel.updatePromotion(id, data);
    if (!updated) return null;
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

/** Thêm item vào promotion có sẵn — UC6: Assign Products to Promotion */
exports.addPromotionItem = async (promotionId, item) => {
    const promotion = await promotionModel.getPromotionById(promotionId);
    if (!promotion) throw new Error('Không tìm thấy promotion');
    if (promotion.status !== 'Active') throw new Error('Không thể thêm sản phẩm vào promotion đã bị vô hiệu hóa');
    await promotionModel.addPromotionItem(promotionId, item);
    return await promotionModel.getPromotionById(promotionId);
};

/**
 * Danh sách promotion đang hiệu lực — UC8: cashier áp dụng khi bán hàng
 */
exports.getActivePromotions = async () => {
    return await promotionModel.getActivePromotions();
};

/**
 * Báo cáo hiệu quả khuyến mãi — UC9: View Promotion Reports
 */
exports.getPromotionReport = async ({ page = 1, limit = 20 } = {}) => {
    const pageNum = Math.max(parseInt(page), 1);
    const pageSize = Math.max(parseInt(limit), 1);
    const offset = (pageNum - 1) * pageSize;

    const [data, total] = await Promise.all([
        promotionModel.getPromotionReport({ limit: pageSize, offset }),
        promotionModel.countPromotionReport()
    ]);

    return {
        data,
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
    };
};

/**
 * Tìm giảm giá áp dụng cho sản phẩm theo productId và productUnitId.
 * Trả về: { discountPercent, discountAmount, promotionId, promotionName, type }
 */
exports.getDiscountByProduct = async ({ productId, productUnitId }) => {
    if (!productId) throw new Error('productId là bắt buộc');
    return await promotionModel.getDiscountByProduct({ productId, productUnitId });
};
