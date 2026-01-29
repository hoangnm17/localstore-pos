const inventoryService = require("../services/inventory.service");

exports.getCategoryStock = async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const data = await inventoryService.getCategoryStock(
        search,
        page,
        limit
    );

    res.json(data);
};

exports.getProductStockByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { search = "", page = 1, limit = 10 } = req.query;

        const data = await inventoryService.getProductStockByCategory(
            categoryId,
            search,
            Number(page),
            Number(limit)
        );

        res.json({
            categoryId,
            page: Number(page),
            limit: Number(limit),
            total: data.total,
            products: data.products
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
