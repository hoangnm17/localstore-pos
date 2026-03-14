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
        changedBy: data.updatedBy || null
    });
};

exports.getLatestByProductId = async (productId) => {
    const [latestSalePriceHistory, latestCostPriceHistory] = await Promise.all([
        priceHistoryModel.getLatestSaleByProductId(productId),
        priceHistoryModel.getLatestCostByProductId(productId)
    ]);

    return {
        latestSalePriceHistory,
        latestCostPriceHistory
    };
};

exports.getAllByProductId = async (productId) => {
    const [salePriceHistories, costPriceHistories] = await Promise.all([
        priceHistoryModel.getAllSaleByProductId(productId),
        priceHistoryModel.getAllCostByProductId(productId)
    ]);

    return {
        salePriceHistories,
        costPriceHistories
    };
};