const categoryService = require('../services/category.service');

exports.getCategoryList = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;

        const data = await categoryService.getCategoryList(
            search,
            parseInt(page),
            parseInt(limit)
        );

        res.json({ success: true, ...data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getCategoryTree = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;

        const data = await categoryService.getCategoryTree(
            search,
            parseInt(page),
            parseInt(limit)
        );

        res.json({ success: true, ...data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await categoryService.getCategoryById(id);
        res.json({ success: true, data });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, parentId, imageUrl } = req.body;
        if (!name) throw new Error('NAME_REQUIRED');

        const id = await categoryService.createCategory(name, parentId, imageUrl);

        res.json({ success: true, id });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parentId, imageUrl } = req.body;

        await categoryService.updateCategory(id, name, parentId, imageUrl);

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        await categoryService.deleteCategory(id);

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
