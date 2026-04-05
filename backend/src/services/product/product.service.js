const productModel = require('../../models/product/product.model');
const promotionService = require('../promotion.service')

function translateSqlError(err) {
    const num = err.number;
    const msg = err.message || '';

    if (num === 2627 || num === 2601) {
        if (/code/i.test(msg)) {
            return new Error('Mã sản phẩm đã tồn tại.');
        }
        if (/barcode|UX_ProductUnits_Barcode_NotNull/i.test(msg)) {
            return new Error('Barcode đã được sử dụng.');
        }
        if (/UQ_ProductUnits_Product_UnitName/i.test(msg)) {
            return new Error('Tên đơn vị cơ bản đang bị trùng với đơn vị tính khác của sản phẩm.');
        }
        return new Error('Dữ liệu bị trùng lặp.');
    }

    if (num === 547) {
        if (/Categories|categoryId/i.test(msg)) {
            return new Error('Danh mục không tồn tại.');
        }
        return new Error('Dữ liệu liên kết không hợp lệ.');
    }

    return err;
}

function validateProductPayload(data) {
    if (!data.code || !String(data.code).trim()) {
        throw new Error('Vui lòng nhập mã sản phẩm.');
    }
    if (!data.name || !String(data.name).trim()) {
        throw new Error('Vui lòng nhập tên sản phẩm.');
    }
    if (!data.baseUnit || !String(data.baseUnit).trim()) {
        throw new Error('Vui lòng nhập đơn vị cơ bản.');
    }
    const salePrice = Number(data.salePrice || 0);
    if (Number.isNaN(salePrice) || salePrice < 0) {
        throw new Error('Giá bán không hợp lệ.');
    }
    if (!Number.isInteger(salePrice)) {
        throw new Error('Giá bán không được là số thập phân.');
    }

    const minThreshold = Number(data.minThreshold || 0);
    if (Number.isNaN(minThreshold) || minThreshold < 0) {
        throw new Error('Ngưỡng tồn kho tối thiểu không hợp lệ.');
    }
    if (!data.allowDecimalQuantity && !data.isCombo && !Number.isInteger(minThreshold)) {
        throw new Error('Ngưỡng tồn kho tối thiểu không được là số thập phân đối với sản phẩm bán theo số lượng.');
    }
    if (data.initialStock !== undefined && data.initialStock !== null) {
        const initStock = Number(data.initialStock);
        if (!Number.isNaN(initStock) && !Number.isInteger(initStock)) {
            throw new Error('Số lượng tồn kho ban đầu không được là số thập phân.');
        }
    }
    if (data.correctedStock !== undefined && data.correctedStock !== null) {
        const corrStock = Number(data.correctedStock);
        if (!Number.isNaN(corrStock) && !Number.isInteger(corrStock)) {
            throw new Error('Số lượng tồn kho điều chỉnh không được là số thập phân.');
        }
    }
    if (data.status && !['Selling', 'StopSelling'].includes(data.status)) {
        throw new Error('Trạng thái sản phẩm không hợp lệ.');
    }
}

exports.getProductList = async (filters) => {
    const safeLimit = Number(filters.limit) > 0 ? Number(filters.limit) : 10;
    const data = await productModel.getProducts(filters);
    const total = await productModel.countProducts(filters);

    return {
        data,
        total,
        totalPages: Math.ceil(total / safeLimit)
    };
};

exports.getProductDetail = async (id) => {
    return await productModel.getProductDetail(id);
};

exports.createProduct = async (productData) => {
    validateProductPayload(productData);
    if (productData.barcode && String(productData.barcode).trim()) {
        const barcodeExists = await productModel.checkBarcodeExists(productData.barcode);
        if (barcodeExists) {
            throw new Error('Barcode đã được sử dụng.');
        }
    }
    try {
        return await productModel.createProduct(productData);
    } catch (err) {
        throw translateSqlError(err);
    }
};

exports.updateProduct = async (id, productData) => {
    validateProductPayload(productData);

    if (productData.barcode && String(productData.barcode).trim()) {
        const barcodeExists = await productModel.checkBarcodeExists(productData.barcode, id);
        if (barcodeExists) {
            throw new Error('Barcode đã được sử dụng.');
        }
    }

    try {
        const updated = await productModel.updateProduct(id, productData);
        if (!updated) throw new Error('Không tìm thấy sản phẩm.');
        return updated;
    } catch (err) {
        if (!err.number) throw err;
        throw translateSqlError(err);
    }
};

exports.stopSellingProduct = async (id) => {
    const updated = await productModel.stopSellingProduct(id);
    if (!updated) throw new Error('Không tìm thấy sản phẩm.');
    return true;
};

exports.startSellingProduct = async (id) => {
    const updated = await productModel.startSellingProduct(id);
    if (!updated) throw new Error('Không tìm thấy sản phẩm.');
    return true;
};

exports.getProductWithBarcode = async (barcode) => {
    const product = await productModel.getProductWithBarcode(barcode);
    if (!product) {
        throw new Error('Không có sản phẩm.')
    }
    return product;
}

exports.getAllProducts = async (filters) => {
    const resultFromModel = await productModel.getAllProducts(filters);

    const rawData = resultFromModel.data || [];
    const totalCount = resultFromModel.total || 0;

    const productsMap = new Map();

    for (const row of rawData) {
        const lowStock = row.minThreshold != null && row.stock <= row.minThreshold;

        const discount = await promotionService.getDiscountByProduct({
            productId: row.id,
            productUnitId: row.unitId
        });

        if (!productsMap.has(row.id)) {
            productsMap.set(row.id, {
                id: row.id,
                name: row.name,
                code: row.code,
                imageUrl: row.imageUrl,
                stock: Math.round((Number(row.stock) || 0) * 1000) / 1000,
                categoryId: row.categoryId,
                units: []
            });
        }

        if (row.unitId) {
            const rawStockValue = Number(row.stock) || 0;
            const factor = Number(row.factor) || 1;
            let stock = rawStockValue / factor;
            if (row.unitType !== 'WEIGHT') {
                stock = Math.floor(stock);
            } else {
                stock = Math.round(stock * 1000) / 1000;
            }
            const price = Number(row.price) || 0;

            const discountPercent = Number(discount?.discountPercent) || 0;
            const discountAmount = Number(discount?.discountAmount) || 0;

            const totalDiscount = Math.round(((price * (discountPercent / 100)) + discountAmount) * 1000) / 1000;

            productsMap.get(row.id).units.push({
                unitId: row.unitId,
                unitName: row.unitName,
                factor: row.factor,
                barcode: row.barcode,
                price: row.price,
                stock: stock,
                unitType: row.unitType,
                lowStock: lowStock,
                totalDiscount: totalDiscount,
                discountedPrice: Math.round((price - totalDiscount) * 1000) / 1000,
                finalPrice: Math.round((price - totalDiscount) * 1000) / 1000,
            });
        }
    }

    return {
        data: Array.from(productsMap.values()),
        pagination: {
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / filters.pageSize),
            currentPage: Number(filters.page),
            pageSize: Number(filters.pageSize)
        }
    };
};


exports.getBarcodeProducts = async (filters) => {
    const rawData = await productModel.getBarcodeProducts(filters);

    const productsMap = new Map();

    for (const row of rawData) {
        const lowStock = row.minThreshold != null && row.stock <= row.minThreshold;

        const discount = await promotionService.getDiscountByProduct({
            productId: row.id,
            productUnitId: row.unitId
        });

        if (!productsMap.has(row.id)) {
            productsMap.set(row.id, {
                id: row.id,
                name: row.name,
                code: row.code,
                imageUrl: row.imageUrl,
                stock: row.stock,
                categoryId: row.categoryId,
                units: []
            });
        }

        if (row.unitId) {
            const factor = Number(row.factor) || 1;
            const stock = Math.floor((Number(row.stock) || 0) / factor);
            const price = Number(row.price) || 0;

            const discountPercent = Number(discount?.discountPercent) || 0;
            const discountAmount = Number(discount?.discountAmount) || 0;

            const totalDiscount = (price * (discountPercent / 100)) + discountAmount;

            productsMap.get(row.id).units.push({
                unitId: row.unitId,
                unitName: row.unitName,
                factor: row.factor,
                barcode: row.barcode,
                price: row.price,
                stock: stock,
                unitType: row.unitType,
                lowStock: lowStock,
                totalDiscount: totalDiscount,
                discountedPrice: price - totalDiscount,
                finalPrice: price - totalDiscount,
            });
        }
    }
    return Array.from(productsMap.values());
};
