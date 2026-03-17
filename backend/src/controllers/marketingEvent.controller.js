const eventModel = require('../models/marketingEvent.model');

module.exports.getAll = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const result = await eventModel.getAll({ page: parseInt(page), limit: parseInt(limit) });
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.getById = async (req, res) => {
    try {
        const event = await eventModel.getById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
        return res.status(200).json({ success: true, data: event });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.create = async (req, res) => {
    try {
        const event = await eventModel.create(req.body);
        return res.status(201).json({ success: true, data: event });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.update = async (req, res) => {
    try {
        const event = await eventModel.update(req.params.id, req.body);
        return res.status(200).json({ success: true, data: event });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.delete = async (req, res) => {
    try {
        await eventModel.delete(req.params.id);
        return res.status(200).json({ success: true, message: 'Xóa sự kiện thành công' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.getActive = async (req, res) => {
    try {
        const events = await eventModel.getActiveEvents();
        return res.status(200).json({ success: true, data: events });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
