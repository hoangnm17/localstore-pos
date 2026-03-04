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



    for (const item of items) {

        const stock = await productModel.getStockByProductId(
            transaction,
            item.productId
        );

        if (!stock) {
            throw new Error(`Stock not found for product ${item.productId}`);
        }

        if (stock.quantity < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productId}`);
        }
        console.log(item);
        console.log(stock)

        await productModel.detuctStock(
            transaction,
            item.productId,
            stock.quantityOnHand - item.quantity
        );
    }
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

const searchProducts = async (keyword) => {
  if (!keyword || keyword.trim().length < 2) {
    return [];
  }

  const products = await productModel.searchProducts(keyword.trim());

  return products;
};

module.exports = {
    deductStock,
    getCategoryStock,
    getProductStockByCategory,
    getProductsBySupplier,
    updateProductStock,
    getProductBasicInfo,
    updateMinThreshold,
    searchProducts
}