const model = require('../models/productUnit.model');

const VALID_UNIT_TYPES = ['PIECE', 'WEIGHT'];

exports.getList = (filters) => model.getList(filters);

exports.getByBarcode = (barcode) => model.getByBarcode(barcode);

exports.getByProduct = (productId) => model.getByProduct(productId);

exports.create = async (data) => {
    if (!VALID_UNIT_TYPES.includes(data.unitType)) {
        throw new Error('Invalid unitType');
    }
    return model.create(data);
};

exports.update = async (id, data) => {
    if (data.unitType && !VALID_UNIT_TYPES.includes(data.unitType)) {
        throw new Error('Invalid unitType');
    }
    return model.update(id, data);
};

exports.remove = (id) => model.remove(id);
