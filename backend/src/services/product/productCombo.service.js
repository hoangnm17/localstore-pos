const comboModel = require('../../models/product/productCombo.model');
const productModel = require('../../models/product/product.model');

function translateSqlError(err) {
    const num = err.number;
    const msg = err.message || '';

    if (num === 2627 || num === 2601) {
        return new Error('Sản phẩm con này đã tồn tại trong combo.');
    }

    if (num === 547) {
        return new Error('Sản phẩm cha hoặc sản phẩm con không hợp lệ.');
    }

    if (/CK_ProductCombos_ParentChild/i.test(msg)) {
        return new Error('Sản phẩm combo không thể chứa chính nó.');
    }

    return err;
}

exports.getComboItems = async (productId) => {
    return comboModel.getComboItems(productId);
};

exports.addComboItem = async (productId, payload) => {
    const quantity = Number(payload.quantity || 1);
    if (Number.isNaN(quantity) || quantity <= 0) {
        throw new Error('Số lượng thành phần combo phải lớn hơn 0.');
    }

    const parentProduct = await productModel.getProductById(productId);
    if (!parentProduct) {
        throw new Error('Không tìm thấy sản phẩm combo.');
    }

    if (!parentProduct.isCombo) {
        throw new Error('Sản phẩm cha không phải là combo.');
    }

    const childProduct = await productModel.getProductById(payload.childProductId);
    if (!childProduct) {
        throw new Error('Không tìm thấy sản phẩm con.');
    }

    if (String(productId) === String(payload.childProductId)) {
        throw new Error('Combo không thể chứa chính nó.');
    }

    if (childProduct.isCombo) {
        throw new Error('Không nên cho combo lồng combo. Sản phẩm con phải là hàng tồn kho thực.');
    }

    try {
        return await comboModel.addComboItem(productId, {
            childProductId: payload.childProductId,
            quantity
        });
    } catch (err) {
        throw translateSqlError(err);
    }
};

exports.removeComboItem = async (comboItemId, productId) => {
    const deleted = await comboModel.removeComboItem(comboItemId, productId);
    if (!deleted) {
        throw new Error('Không tìm thấy thành phần combo.');
    }
    return true;
};