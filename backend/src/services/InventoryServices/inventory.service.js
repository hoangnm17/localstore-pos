const Category = require("../../models/categoryStock.model");
const productModel = require("../../models/productStock.model");

exports.getCategoryStock = async (search, page, limit) => {
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

exports.getProductStockByCategory = async (
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

exports.getProductsBySupplier = async (
    supplierId,
    search,
    page,
    limit
) => {
    const offset = (page - 1) * limit;

    const products = await productModel.getProductsBySupplier(
        supplierId,
        search,
        limit,
        offset
    );

    const total = await productModel.countProductsBySupplier(
        supplierId,
        search
    );

    return {
        products,
        total
    };
};

exports.updateProductStock = async (productId, quantity) => {
    return await productModel.updateStock(productId, quantity);
};

// Thêm hàm mới để controller dùng
exports.getProductBasicInfo = async (productId) => {
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

    await productModel.updateStock(
      transaction,
      item.productId,
      stock.quantity - item.quantity
    );
  }
};

module.exports = {
    deductStock,
}