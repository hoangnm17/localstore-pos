const comboService = require('../services/product/productCombo.service');

exports.getComboItems = async (req, res) => {
    try {
        const data = await comboService.getComboItems(req.params.productId);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getComboCostPrice = async (req, res) => {
    try {
        const costPrice = await comboService.getComboCostPrice(req.params.productId);
        res.json({ success: true, data: { costPrice } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addComboItem = async (req, res) => {
    try {
        const data = await comboService.addComboItem(req.params.productId, req.body);
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.removeComboItem = async (req, res) => {
    try {
        await comboService.removeComboItem(req.params.comboItemId, req.params.productId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.assembleCombo = async (req, res) => {
    try {
        const data = await comboService.assembleCombo(req.params.productId, req.body.quantity);
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateComboStock = async (req, res) => {
    try {
        const data = await comboService.updateComboStock(req.params.productId, req.body.quantity);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
