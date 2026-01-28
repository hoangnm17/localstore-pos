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
