const Category = require("../../models/categoryStock.model");
const productModel = require("../../models/productStock.model");

const getCategoryStock = async (search, page, limit) => {
    const offset = (page - 1) * limit;

    const categories = await Category.getCategoryStock(
        search,
        limit,
        offset
    );

    const totalCategories = await Category.countCategories(search);

    return {
        pagination: {
            page,
            limit,
            totalCategories,
            totalPages: Math.ceil(totalCategories / limit)
        },
        categories
    };
};

const getProductStockByCategory = async (
    categoryId,
    search,
    page,
    limit
) => {
    const offset = (page - 1) * limit;

    const products = await productModel.getProductsByCategory(
        categoryId,
        search,
        limit,
        offset
    );

    const total = await productModel.countProductsByCategory(
        categoryId,
        search
    );

    return {
        products,
        total
    };
};

const getProductsBySupplier = async (
    supplierId,
    search
) => {

    const products = await productModel.getProductsBySupplier(
        supplierId,
        search
    );

    return {
        products,
        total: products.length
    };
};

const updateProductStock = async (productId, quantity) => {
    return await productModel.updateStock(productId, quantity);
};

// Thêm hàm mới để controller dùng
const getProductBasicInfo = async (productId) => {
    return await productModel.getProductBasicInfo(productId);
};

const deductStock = async (transaction, items) => {

    const updatedStocks = [];

    for (const item of items) {
        const stock = await productModel.getStockByProductId(
            transaction,
            item.productId
        );

        if (!stock) {
            throw new Error(`Stock not found for product ${item.productId}`);
        }

        if (stock.quantityOnHand < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        const newStock = stock.quantityOnHand - item.quantity;

        await productModel.detuctStock(
            transaction,
            item.productId,
            newStock
        );

        updatedStocks.push({
            productId: item.productId,
            stock: newStock
        });
    }

    return updatedStocks;
};

const updateMinThreshold = async (productId, minThreshold) => {
    if (!productId) {
        throw new Error("ProductId is required");
    }

    if (minThreshold == null || minThreshold < 0) {
        throw new Error("Min threshold must be >= 0");
    }

    const updatedStock = await productModel.updateMinThreshold(
        productId,
        minThreshold
    );

    if (!updatedStock) {
        throw new Error("Inventory stock not found");
    }

    return updatedStock;
};

module.exports = {
    deductStock,
    getCategoryStock,
    getProductStockByCategory,
    getProductsBySupplier,
    updateProductStock,
    getProductBasicInfo,
    updateMinThreshold
}