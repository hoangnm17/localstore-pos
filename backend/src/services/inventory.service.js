const Category = require("../models/categoryStock.model");
const productModel = require("../models/productStock.model");

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

exports.updateProductStock = async (productId, quantity) => {
    return await productModel.updateStock(productId, quantity);
};
