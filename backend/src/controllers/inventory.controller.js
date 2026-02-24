const inventoryService = require("../services/InventoryServices/inventory.service");
const problematicService = require("../services/InventoryServices/problematic.service");

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
            categoryName: data.products[0]?.categoryName || "",
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

exports.updateProductStock = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (productId === undefined || quantity === undefined) {
            return res.status(400).json({
                message: "productId and quantity are required"
            });
        }

        if (typeof quantity !== "number" || Number.isNaN(quantity)) {
            return res.status(400).json({
                message: "Quantity must be a valid number"
            });
        }

        if (quantity < 0) {
            return res.status(400).json({
                message: "Quantity must be greater than or equal to 0"
            });
        }

        const product = await inventoryService.getProductBasicInfo(productId); // cần implement hàm này

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.allowDecimalQuantity === 0 && !Number.isInteger(quantity)) {
            return res.status(400).json({
                message: "Sản phẩm này chỉ chấp nhận số lượng nguyên (không thập phân)"
            });
        }

        const rowsAffected = await inventoryService.updateProductStock(productId, quantity);

        if (rowsAffected === 0) {
            return res.status(404).json({
                message: "Product not found or no stock record"
            });
        }

        res.json({
            message: "Stock updated successfully"
        });
    } catch (err) {
        console.error("Update stock error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.getProductsBySupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const { search = "", page = 1, limit = 10 } = req.query;

        const data = await inventoryService.getProductsBySupplier(
            Number(supplierId),
            search,
            Number(page),
            Number(limit)
        );

        res.json({
            supplierId: Number(supplierId),
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

exports.createProblematicReport = async (req, res) => {
    try {
        await problematicService.createReport(req.body, req.user);
        res.status(201).json({ message: "Report created successfully" });
    } catch (err) {
        if (err.message === "PERMISSION_DENIED") {
            return res.status(403).json({ message: "Permission denied" });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.getProblematicReports = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const filters = req.query;

        const reports = await problematicService.getReports({
            userId,
            role,
            filters
        });

        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};