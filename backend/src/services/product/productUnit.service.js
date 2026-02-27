const productUnitModel = require('../../models/product/productUnit.model');
const productModel = require('../../models/product/product.model');

const VALID_UNIT_TYPES = ['PIECE', 'WEIGHT'];

function translateSqlError(err) {
    const num = err.number;
    const msg = err.message || '';

    if (num === 2627 || num === 2601) {
        if (/barcode/i.test(msg)) {
            return new Error('Barcode đơn vị tính đã được dùng. Vui lòng dùng barcode khác.');
        }
        return new Error('Dữ liệu đơn vị tính bị trùng lặp. Vui lòng kiểm tra lại.');
    }

    if (num === 547) {
        if (/productId|Products/i.test(msg)) {
            return new Error('Sản phẩm không tồn tại hoặc đã bị xóa.');
        }
        return new Error('Dữ liệu liên kết không hợp lệ.');
    }

    return err;
}

exports.getList = (filters) => productUnitModel.getList(filters);

exports.getByBarcode = (barcode) => productUnitModel.getByBarcode(barcode);

exports.getByProduct = (productId) => productUnitModel.getByProduct(productId);

exports.create = async (data) => {
    if (!VALID_UNIT_TYPES.includes(data.unitType)) {
        throw new Error('Loại đơn vị không hợp lệ. Chỉ chấp nhận PIECE hoặc WEIGHT.');
    }
    const product = await productModel.getProductById(data.productId);
    if (!product) {
        throw new Error('Không tìm thấy sản phẩm.');
    }
    if (data.barcode) {
        const existed = await productUnitModel.getByBarcode(data.barcode);
        if (existed) throw new Error('Barcode đã được dùng bởi đơn vị tính khác.');
    }

    try {
        return await productUnitModel.create(data);
    } catch (err) {
        throw translateSqlError(err);
    }
};

exports.update = async (id, data) => {
    if (data.unitType && !VALID_UNIT_TYPES.includes(data.unitType)) {
        throw new Error('Loại đơn vị không hợp lệ. Chỉ chấp nhận PIECE hoặc WEIGHT.');
    }
    if (data.barcode) {
        const existed = await productUnitModel.getByBarcode(data.barcode);
        // Cho phép barcode trùng với chính nó (update)
        if (existed && String(existed.id) !== String(id)) {
            throw new Error('Barcode đã được dùng bởi đơn vị tính khác.');
        }
    }

    try {
        return await productUnitModel.update(id, data);
    } catch (err) {
        throw translateSqlError(err);
    }
};

exports.remove = (id) => productUnitModel.remove(id);
