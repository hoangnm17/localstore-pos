const inventoryService = require("../services/InventoryServices/inventory.service");
const problematicService = require("../services/InventoryServices/problematic.service");

const getCategoryStock = async (req, res) => {
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

const getProductStockByCategory = async (req, res) => {
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

const updateProductStock = async (req, res) => {
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

const getProductsBySupplier = async (req, res) => {
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

const createProblematicReport = async (req, res) => {
    try {
        const result = await problematicService.createReport(req.body, req.user);

        console.log("Service result:", result);

        return res.status(201).json({
            success: true,
            message: "Report created successfully",
            data: result
        });

    } catch (err) {
        if (err.message === "PERMISSION_DENIED") {
            return res.status(403).json({
                success: false,
                message: "Permission denied"
            });
        }

        if (err.message === "TITLE_REQUIRED") {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        if (err.message === "DESCRIPTION_REQUIRED") {
            return res.status(400).json({
                success: false,
                message: "Issue description is required"
            });
        }

        if (err.message === "STAFF_NOT_FOUND") {
            return res.status(400).json({
                success: false,
                message: "Staff not found for this user"
            });
        }

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const getProblematicReports = async (req, res) => {
    try {
        const { id, roleId } = req.user;

        const { status, createdFrom, createdTo } = req.query;

        const reports = await problematicService.getReports({
            userId: id,
            roleId,
            filters: {
                status,
                createdFrom,
                createdTo
            }
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

const updateProblematicStatus = async (req, res) => {
    try {
        const { id, roleId } = req.user;
        const reportId = req.params.id;
        const { status } = req.body;

        const result = await problematicService.updateStatus({
            reportId,
            status,
            roleId,
            updatedBy: id
        });

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: result
        });

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

const updateMinThreshold = async (req, res) => {
    try {
        const { productId } = req.params;
        const { minThreshold } = req.body;

        const updatedStock = await inventoryService.updateMinThreshold(
            productId,
            minThreshold
        );

        return res.status(200).json({
            success: true,
            data: updatedStock
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    const products = await inventoryService.searchProducts(keyword);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Search products error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getLowStockProducts = async (req, res) => {

    try {

        const result = await inventoryService.getLowStockProducts(req.user);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

const searchProductUnits = async (req, res) => {

    try {

        const { keyword } = req.query;

        const result = await inventoryService.searchProductUnits(keyword);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getCategoryStock,
    getProductStockByCategory,
    updateProductStock,
    getProductsBySupplier,
    createProblematicReport,
    getProblematicReports,
    updateProblematicStatus,
    updateMinThreshold,
    searchProducts,
    getLowStockProducts,
    searchProductUnits
}