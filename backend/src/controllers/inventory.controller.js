const inventoryService = require("../services/InventoryServices/inventory.service");
const problematicService = require("../services/InventoryServices/problematic.service");

exports.getCategoryStock = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const data = await inventoryService.getCategoryStock(
            search,
            page,
            limit
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
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

        return res.status(200).json({
            success: true,
            data: {
                categoryId,
                categoryName: data.products[0]?.categoryName || "",
                page: Number(page),
                limit: Number(limit),
                total: data.total,
                products: data.products
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.updateProductStock = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (productId === undefined || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "productId and quantity are required"
            });
        }

        if (typeof quantity !== "number" || Number.isNaN(quantity)) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a valid number"
            });
        }

        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than or equal to 0"
            });
        }

        const product = await inventoryService.getProductBasicInfo(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.allowDecimalQuantity === 0 && !Number.isInteger(quantity)) {
            return res.status(400).json({
                success: false,
                message: "San pham chi chap nhan so luong nguyen"
            });
        }

        const rowsAffected = await inventoryService.updateProductStock(productId, quantity);

        if (rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found or no stock record"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                message: "Stock updated successfully"
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getProductsBySupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const { search = "" } = req.query;

        const data = await inventoryService.getProductsBySupplier(
            Number(supplierId),
            search
        );

        return res.status(200).json({
            success: true,
            data: {
                supplierId: Number(supplierId),
                total: data.total,
                products: data.products
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.createProblematicReport = async (req, res) => {
    try {
        await problematicService.createReport(req.body, req.user);

        return res.status(201).json({
            success: true,
            data: {
                message: "Report created successfully"
            }
        });

    } catch (err) {
        if (err.message === "PERMISSION_DENIED") {
            return res.status(403).json({
                success: false,
                message: "Permission denied"
            });
        }

        return res.status(500).json({
            success: false,
            message: err.message
        });
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

        return res.status(200).json({
            success: true,
            data: reports
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};