const Category = require("../../models/categoryStock.model");
const productModel = require("../../models/productStock.model");

const getCategoryStock = async (search, page, limit) => {
    const offset = (page - 1) * limit;

    const categories = await Category.getCategoryStock(
        search,
        limit,
        offset
    );

    const totalCategories = await Category.countCategories(search);

    return {
        pagination: {
            page,
            limit,
            totalCategories,
            totalPages: Math.ceil(totalCategories / limit)
        },
        categories
    };
};

const getProductStockByCategory = async (
    categoryId,
    search,
    page,
    limit
) => {
    const offset = (page - 1) * limit;

    const products = await productModel.getProductsByCategory(
        categoryId,
        search,
        limit,
        offset
    );

    const total = await productModel.countProductsByCategory(
        categoryId,
        search
    );

    return {
        products,
        total
    };
};

const getProductsBySupplier = async (
    supplierId,
    search
) => {

    const products = await productModel.getProductsBySupplier(
        supplierId,
        search
    );

    return {
        products,
        total: products.length
    };
};

const updateProductStock = async (productId, quantity) => {
    return await productModel.updateStock(productId, quantity);
};

const getProductBasicInfo = async (productId) => {
    return await productModel.getProductBasicInfo(productId);
};

const addStock = async (transaction, productId, quantity) => {
    return await productModel.addStock(transaction, productId, quantity);
};


const deductStock = async (transaction, items) => {
    const updatedStocks = [];

    for (const item of items) {
        if (!item.productId) {
            throw new Error("Invalid productId");
        }
        if (item.baseQuantity == null) {
            throw new Error(`baseQuantity missing for product ${item.productId}`);
        }
        const deductQty = Number(item.baseQuantity);

        if (deductQty <= 0) {
            throw new Error(`Invalid deduct quantity for product ${item.productId}`);
        }

        const stock = await productModel.getStockByProductId(
            transaction,
            item.productId
        );

        if (!stock) {
            throw new Error(`Stock not found for product ${item.productId}`);
        }

        const currentStock = Number(stock.quantityOnHand || 0);

        if (currentStock < deductQty) {
            throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        await productModel.deductStock(
            transaction,
            item.productId,
            deductQty
        );

        updatedStocks.push({
            productId: item.productId,
            oldStock: currentStock,
            deductedQuantity: deductQty,
            stock: currentStock - deductQty
        });
    }

    return updatedStocks;
};

const updateMinThreshold = async (productId, minThreshold) => {
    if (!productId) {
        throw new Error("ProductId is required");
    }

    if (minThreshold == null || minThreshold < 0) {
        throw new Error("Min threshold must be >= 0");
    }

    const updatedStock = await productModel.updateMinThreshold(
        productId,
        minThreshold
    );

    if (!updatedStock) {
        throw new Error("Inventory stock not found");
    }

    return updatedStock;
};

const searchProducts = async (keyword) => {
  if (!keyword || keyword.trim().length < 2) {
    return [];
  }

  const products = await productModel.searchProducts(keyword.trim());

  return products;
};

const getLowStockProducts = async (currentUser) => {

    if (!currentUser.permissions.includes("CREATE_PURCHASE_ORDER")) {
        throw new Error("PERMISSION_DENIED");
    }

    return await productModel.getLowStockProductUnits();

};

const searchProductUnits = async (keyword) => {

    if (!keyword) {
        return [];
    }

    return await productModel.searchProductUnits(keyword);
};


module.exports = {
    deductStock,
    getCategoryStock,
    getProductStockByCategory,
    getProductsBySupplier,
    updateProductStock,
    getProductBasicInfo,
    updateMinThreshold,
    searchProducts,
    getLowStockProducts,
    searchProductUnits,
    addStock,
}