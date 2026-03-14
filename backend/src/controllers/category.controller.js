const categoryService = require('../services/category.service');

function toVietnamese(err) {
    const map = {
        'CATEGORY_NOT_FOUND': 'Không tìm thấy danh mục.',
        'CATEGORY_HAS_PRODUCT': 'Không thể xóa danh mục đang có sản phẩm.',
        'CIRCULAR_PARENT': 'Không thể đặt danh mục con làm cha của chính nó.',
        'NAME_REQUIRED': 'Tên danh mục không được để trống.',
        'Category not found': 'Không tìm thấy danh mục.',
        'Category name is required': 'Tên danh mục không được để trống.',
    };
    return map[err.message] || err.message;
}

exports.getCategoryList = async (req, res) => {
    try {
        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
        const data = await categoryService.getCategoryList(search, pageNum, limitNum);
        res.json({ success: true, ...data });
    } catch (err) {
        res.status(500).json({ success: false, message: toVietnamese(err) });
    }
};

exports.getCategoryTree = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
        const data = await categoryService.getCategoryTree(search, pageNum, limitNum);
        res.json({ success: true, ...data });
    } catch (err) {
        res.status(500).json({ success: false, message: toVietnamese(err) });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const data = await categoryService.getCategoryById(parseInt(req.params.id));
        res.json({ success: true, data });
    } catch (err) {
        res.status(404).json({ success: false, message: toVietnamese(err) });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, parentId, imageUrl } = req.body;
        if (!name) throw new Error('NAME_REQUIRED');
        const id = await categoryService.createCategory(name, parentId ? parseInt(parentId) : null, imageUrl);
        res.json({ success: true, id });
    } catch (err) {
        res.status(400).json({ success: false, message: toVietnamese(err) });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parentId, imageUrl } = req.body;
        await categoryService.updateCategory(id, name, parentId ? parseInt(parentId) : null, imageUrl);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: toVietnamese(err) });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await categoryService.deleteCategory(id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: toVietnamese(err) });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();

        res.json({
            success: true,
            data: categories
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
