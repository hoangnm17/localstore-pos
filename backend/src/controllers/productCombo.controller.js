const comboService = require('../services/product/productCombo.service');

exports.getComboItems = async (req, res) => {
    try {
        const data = await comboService.getComboItems(req.params.productId);
        res.json({ success: true, data });
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
