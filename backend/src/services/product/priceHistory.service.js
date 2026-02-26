const priceHistoryModel = require('../../models/product/priceHistory.model');

exports.recordInitialPrice = async (productId, data) => {
    if (data.salePrice == null && data.costPrice == null) return;

    await priceHistoryModel.insert({
        productId,
        salePrice: data.salePrice,
        costPrice: data.costPrice,
        createdBy: data.createdBy || null
    });
};

exports.recordPriceChange = async (productId, data) => {
    await priceHistoryModel.insert({
        productId,
        salePrice: data.salePrice,
        costPrice: data.costPrice,
        createdBy: data.updatedBy || null
    });
};

exports.getLatestByProductId = async (productId) => {
    return await priceHistoryModel.getLatestByProductId(productId);
};