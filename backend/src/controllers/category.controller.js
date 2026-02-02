const categoryService = require('../services/category.service');

exports.getCategoryTree = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;

        const data = await categoryService.getCategoryTree(
            search,
            parseInt(page),
            parseInt(limit)
        );

        res.json({
            success: true,
            ...data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
