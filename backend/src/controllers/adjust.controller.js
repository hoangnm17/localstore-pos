const inventoryAdjustmentService = require("../services/InventoryServices/adjust.service");

const createAdjustment = async (req, res) => {
    try {

        const result = await inventoryAdjustmentService.createAdjustment(
            req.user,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Tạo phiếu điều chỉnh thành công",
            data: result
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateStatus = async (req, res) => {
    try {

        const result = await inventoryAdjustmentService.updateStatus(
            req.user,
            req.params.id,
            req.body.status
        );

        return res.json({
            success: true,
            message: "Cập nhật trạng thái thành công",
            data: result
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAdjustments = async (req, res) => {

    try {

        const { fromDate, toDate, status } = req.query;

        const filters = {
            fromDate,
            toDate,
            status
        };

        const data = await inventoryAdjustmentService.getAdjustments(filters);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAdjustmentDetail = async (req, res) => {

    try {

        const { id } = req.params;

        const data = await inventoryAdjustmentService.getAdjustmentDetail(id);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createAdjustment,
    updateStatus,
    getAdjustments,
    getAdjustmentDetail
};