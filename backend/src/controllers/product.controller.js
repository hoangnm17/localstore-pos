const productService = require('../services/product/product.service');

exports.getProducts = async (req, res) => {
    try {
        const {
            search = '',
            categoryId,
            status = 'Selling',
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
        const offset = (pageNumber - 1) * pageSize;

        const result = await productService.getProductList({
            search,
            status: status === 'All' ? null : status,
            categoryId: categoryId ? parseInt(categoryId, 10) : null,
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
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await productService.getProductDetail(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const id = await productService.createProduct({
            ...req.body,
            createdBy: req.user.staffId
        });
        res.status(201).json({ success: true, id });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        await productService.updateProduct(req.params.id, {
            ...req.body,
            updatedBy: req.user.staffId
        });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await productService.stopSellingProduct(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

exports.startSellingProduct = async (req, res) => {
    try {
        await productService.startSellingProduct(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

exports.getProductWithBarcode = async (req, res) => {
    try {
        const barcode = req.params.barcode;
        const product = await productService.getProductWithBarcode(barcode);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {

        const filters = {
            page: Number(req.query.page) || 1,
            pageSize: Number(req.query.limit) || 20,
            search: req.query.search || null,
            status: req.query.status || 'Selling',
            categoryId: req.query.categoryId
                ? Number(req.query.categoryId)
                : null
        };

        const data = await productService.getAllProducts(filters);

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};