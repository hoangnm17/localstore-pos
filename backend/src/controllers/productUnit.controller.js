const service = require('../services/product/productUnit.service');

exports.getProductUnits = async (req, res) => {
    try {
        const data = await service.getList(req.query);
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

exports.getByBarcode = async (req, res) => {
    try {
        const unit = await service.getByBarcode(req.params.barcode);
        if (!unit) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: unit });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

exports.getByProduct = async (req, res) => {
    const data = await service.getByProduct(req.params.productId);
    res.json({ success: true, data });
};

exports.create = async (req, res) => {
    try {
        const id = await service.create(req.body);
        res.json({ success: true, id });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        await service.update(req.params.id, req.body);
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

exports.remove = async (req, res) => {
    try {
        await service.remove(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
