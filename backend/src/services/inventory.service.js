const Category = require("../models/category.model");

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
