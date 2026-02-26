const comboModel = require('../../models/product/productCombo.model');

exports.getComboItems = async (productId) => comboModel.getComboItems(productId);

exports.addComboItem = async (productId, payload) => comboModel.addComboItem(productId, payload);

exports.removeComboItem = async (comboItemId, productId) => comboModel.removeComboItem(comboItemId, productId);
