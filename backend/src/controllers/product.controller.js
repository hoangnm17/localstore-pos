const productService = require('../services/product.service');

exports.getProducts = async (req, res) => {
    try {
        const {
            search = '',
            categoryId,
            status = 'Selling',
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Math.max(parseInt(page), 1);
        const pageSize = Math.max(parseInt(limit), 1);
        const offset = (pageNumber - 1) * pageSize;

        const result = await productService.getProductList({
            search,
            status,
            categoryId: categoryId ? parseInt(categoryId) : null,
            limit: pageSize,
            offset
        });

        res.json({
            success: true,
            page: pageNumber,
            limit: pageSize,
            ...result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};