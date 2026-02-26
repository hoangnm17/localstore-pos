const productUnitModel = require('../../models/product/productUnit.model');
const productModel = require('../../models/product/product.model');

const VALID_UNIT_TYPES = ['PIECE', 'WEIGHT'];

exports.getList = (filters) => productUnitModel.getList(filters);

exports.getByBarcode = (barcode) => productUnitModel.getByBarcode(barcode);

exports.getByProduct = (productId) => productUnitModel.getByProduct(productId);

exports.create = async (data) => {
    if (!VALID_UNIT_TYPES.includes(data.unitType)) {
        throw new Error('Invalid unitType');
    }
    const product = await productModel.getProductById(data.productId);
    if (!product) {
        throw new Error('Product not found');
    }
    if (data.barcode) {
        const existed = await productUnitModel.getByBarcode(data.barcode);
        if (existed) throw new Error('Barcode already exists');
    }
    return productUnitModel.create(data);
};

exports.update = async (id, data) => {
    if (data.unitType && !VALID_UNIT_TYPES.includes(data.unitType)) {
        throw new Error('Invalid unitType');
    }
    return productUnitModel.update(id, data);
};

exports.remove = (id) => productUnitModel.remove(id);
