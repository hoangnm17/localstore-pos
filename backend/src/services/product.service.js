const productModel = require('../models/product.model');

exports.getProductList = async (filters) => {
    const data = await productModel.getProducts(filters);
    const total = await productModel.countProducts(filters);

    return {
        data,
        total,
        totalPages: Math.ceil(total / filters.limit)
    };
};
