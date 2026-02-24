const productModel = require('../../models/product/product.model');

exports.getProductList = async (filters) => {
    const data = await productModel.getProducts(filters);
    const total = await productModel.countProducts(filters);

    return {
        data,
        total,
        totalPages: Math.ceil(total / filters.limit)
    };
};
exports.getProductDetail = async (id) => {
    return await productModel.getProductById(id);
};

exports.createProduct = async (productData) => {
    // Validate required fields
    if (!productData.code || !productData.name || !productData.baseUnit) {
        throw new Error('Code, name, and baseUnit are required');
    }

    const id = await productModel.createProduct(productData);
    return id;
};

exports.updateProduct = async (id, productData) => {
    // Validate required fields
    if (!productData.code || !productData.name || !productData.baseUnit) {
        throw new Error('Code, name, and baseUnit are required');
    }

    const updated = await productModel.updateProduct(id, productData);
    if (!updated) {
        throw new Error('Product not found or update failed');
    }
    return updated;
};

exports.stopSellingProduct = async (id) => {
    const updated = await productModel.stopSellingProduct(id);

    if (!updated) {
        throw new Error('Product not found');
    }
    return true;
};

exports.startSellingProduct = async (id) => {
    const updated = await productModel.startSellingProduct(id);

    if (!updated) {
        throw new Error('Product not found');
    }
    return true;
};