const priceHistoryModel = require('../../models/product/priceHistory.model');

exports.recordInitialPrice = async (productId, data) => {
    if (data.salePrice == null || data.productUnitId == null) return;

    await priceHistoryModel.insertSaleHistory({
        productId,
        productUnitId: data.productUnitId,
        oldSalePrice: null,
        newSalePrice: data.salePrice,
        changedBy: data.createdBy || null
    });
};

exports.recordPriceChange = async (productId, data) => {
    if (data.newSalePrice == null || data.productUnitId == null) return;

    await priceHistoryModel.insertSaleHistory({
        productId,
        productUnitId: data.productUnitId,
        oldSalePrice: data.oldSalePrice ?? null,
        newSalePrice: data.newSalePrice,
        changedBy: data.updatedBy
    });
};

exports.getLatestByProductId = async (productId) => {
    const [latestSalePriceHistory] = await Promise.all([
        priceHistoryModel.getLatestSaleByProductId(productId)
    ]);

    return {
        latestSalePriceHistory
    };
};

exports.getAllByProductId = async (productId) => {
    const [salePriceHistories] = await Promise.all([
        priceHistoryModel.getAllSaleByProductId(productId),
    ]);

    return {
        salePriceHistories
    };
};