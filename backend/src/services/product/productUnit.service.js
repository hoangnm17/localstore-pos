const productUnitModel = require('../../models/product/productUnit.model');
const productModel = require('../../models/product/product.model');

const VALID_UNIT_TYPES = ['PIECE', 'WEIGHT'];

function translateSqlError(err) {
    const num = err.number;
    const msg = err.message || '';

    if (num === 2627 || num === 2601) {
        if (/barcode/i.test(msg)) {
            return new Error('Barcode đơn vị tính đã được dùng.');
        }
        if (/UQ_ProductUnits_Product_UnitName/i.test(msg)) {
            return new Error('Tên đơn vị tính đã tồn tại trong sản phẩm này.');
        }
        if (/UX_ProductUnits_OneBaseUnit/i.test(msg)) {
            return new Error('Base unit đã tồn tại. Không thể tạo thêm đơn vị có conversionFactor = 1.');
        }
        return new Error('Dữ liệu đơn vị tính bị trùng.');
    }

    if (num === 547) {
        return new Error('Dữ liệu liên kết không hợp lệ.');
    }

    return err;
}

function validatePayload(data) {
    if (!data.unitName || !String(data.unitName).trim()) {
        throw new Error('Tên đơn vị tính không được để trống.');
    }

    if (!VALID_UNIT_TYPES.includes(data.unitType)) {
        throw new Error('Loại đơn vị không hợp lệ. Chỉ chấp nhận PIECE hoặc WEIGHT.');
    }

    const conversionFactor = Number(data.conversionFactor);
    if (Number.isNaN(conversionFactor) || conversionFactor <= 0) {
        throw new Error('Hệ số quy đổi phải lớn hơn 0.');
    }

    const salePrice = Number(data.salePrice);
    if (Number.isNaN(salePrice) || salePrice < 0) {
        throw new Error('Giá bán đơn vị tính không hợp lệ.');
    }
}

exports.getList = (filters) => productUnitModel.getList(filters);

exports.getByBarcode = (barcode) => productUnitModel.getByBarcode(barcode);

exports.getByProduct = (productId) => productUnitModel.getByProduct(productId);

exports.create = async (data) => {
    validatePayload(data);

    if (Number(data.conversionFactor) === 1) {
        throw new Error('Base unit phải được quản lý ở API sản phẩm, không tạo ở API đơn vị tính.');
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
    const current = await productUnitModel.getById(id);
    if (!current) {
        throw new Error('Không tìm thấy đơn vị tính.');
    }

    if (Number(current.conversionFactor) === 1) {
        throw new Error('Base unit phải được cập nhật ở API sản phẩm.');
    }

    const merged = {
        ...current,
        ...data
    };

    validatePayload(merged);

    if (Number(merged.conversionFactor) === 1) {
        throw new Error('Không được đổi đơn vị phụ thành base unit.');
    }

    if (merged.barcode) {
        const existed = await productUnitModel.getByBarcode(merged.barcode);
        if (existed && String(existed.productUnitId) !== String(id)) {
            throw new Error('Barcode đã được dùng bởi đơn vị tính khác.');
        }
    }

    try {
        return await productUnitModel.update(id, merged);
    } catch (err) {
        throw translateSqlError(err);
    }
};

exports.remove = async (id) => {
    const current = await productUnitModel.getById(id);
    if (!current) {
        throw new Error('Không tìm thấy đơn vị tính.');
    }

    if (Number(current.conversionFactor) === 1) {
        throw new Error('Không được xóa base unit bằng API đơn vị tính.');
    }

    const deleted = await productUnitModel.remove(id);
    if (!deleted) {
        throw new Error('Xóa đơn vị tính thất bại.');
    }

    return true;
};