const productModel = require('../../models/product/product.model');

function translateSqlError(err) {
    const num = err.number;
    const msg = err.message || '';

    if (num === 2627 || num === 2601) {
        if (/UQ_Products_.*code/i.test(msg) || /\bcode\b/i.test(msg)) {
            return new Error('Mã sản phẩm đã tồn tại. Vui lòng dùng mã khác.');
        }
        if (/UQ_Products_.*barcode/i.test(msg) || /\bbarcode\b/i.test(msg)) {
            return new Error('Barcode đã được dùng bởi sản phẩm khác.');
        }
        if (/UQ_Products_.*name/i.test(msg) || /\bname\b/i.test(msg)) {
            return new Error('Tên sản phẩm đã tồn tại. Vui lòng dùng tên khác.');
        }
        return new Error('Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại mã, tên hoặc barcode.');
    }

    if (num === 547) {
        if (/categoryId|Categories/i.test(msg)) {
            return new Error('Danh mục không hợp lệ hoặc không tồn tại.');
        }
        return new Error('Dữ liệu liên kết không hợp lệ. Vui lòng kiểm tra lại thông tin.');
    }

    return err;
}

exports.getProductList = async (filters) => {
    const data = await productModel.getProducts(filters);
    const total = await productModel.countProducts(filters);

    return {
        data,
        total,
        totalPages: Math.ceil(total / filters.limit)
    };
};

exports.getProductDetail = async (id) => {
    return await productModel.getProductById(id);
};

exports.createProduct = async (productData) => {
    if (!productData.code || !productData.name || !productData.baseUnit) {
        throw new Error('Vui lòng điền đầy đủ mã sản phẩm, tên và đơn vị cơ bản.');
    }

    try {
        const id = await productModel.createProduct(productData);
        return id;
    } catch (err) {
        throw translateSqlError(err);
    }
};

exports.updateProduct = async (id, productData) => {
    if (!productData.code || !productData.name || !productData.baseUnit) {
        throw new Error('Vui lòng điền đầy đủ mã sản phẩm, tên và đơn vị cơ bản.');
    }

    try {
        const updated = await productModel.updateProduct(id, productData);
        if (!updated) {
            throw new Error('Không tìm thấy sản phẩm hoặc cập nhật thất bại.');
        }
        return updated;
    } catch (err) {
        if (!err.number) throw err;
        throw translateSqlError(err);
    }
};

exports.stopSellingProduct = async (id) => {
    const updated = await productModel.stopSellingProduct(id);
    if (!updated) {
        throw new Error('Không tìm thấy sản phẩm.');
    }
    return true;
};

exports.startSellingProduct = async (id) => {
    const updated = await productModel.startSellingProduct(id);
    if (!updated) {
        throw new Error('Không tìm thấy sản phẩm.');
    }
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
    const rawData = await productModel.getAllProducts(filters);

    const productsMap = new Map();
    
    rawData.forEach(row => {
        console.log(row);
        const lowStock = row.minThreshold != null && row.stock <= row.minThreshold;
        
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
            productsMap.get(row.id).units.push({
                unitId: row.unitId,
                unitName: row.unitName,
                factor: row.factor,
                barcode: row.barcode,
                price: row.price,
                stock: row.factor ? Math.floor(row.stock / row.factor) : 0,
                unitType: row.unitType,
                lowStock: lowStock,
            });
        }
    });

    return Array.from(productsMap.values());
};