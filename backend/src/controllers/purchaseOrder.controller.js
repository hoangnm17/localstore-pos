const purchaseOrderService = require("../services/InventoryServices/purchaseOrder.service");

const createPurchaseOrder = async (req, res) => {
    try {

        const userId = req.user.id;
        const { items, note } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Danh sach san pham khong duoc rong"
            });
        }

        const result = await purchaseOrderService.createPurchaseOrder(req.user, note, items);

        return res.json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Loi server"
        });
    }
};

const updateStatus = async (req, res) => {
    try {

        const { id } = req.params;
        const { status } = req.body;
        const currentUser = req.user;

        const result = await purchaseOrderService.updateStatus(
            id,
            status,
            currentUser
        );

        res.json({
            success: true,
            data: result
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};


const receiveOrder = async (req, res) => {
    try {

        const { id } = req.params;
        const { items } = req.body;
        const currentUser = req.user;

        const result = await purchaseOrderService.receiveOrder(
            id,
            items,
            currentUser
        );

        res.json({
            success: true,
            data: result
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

const getPurchaseOrders = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const filters = {
            status: req.query.status,
            fromDate: req.query.fromDate,
            toDate: req.query.toDate
        };

        const result = await purchaseOrderService.getPurchaseOrders(
            page,
            limit,
            filters
        );

        res.json({
            success: true,
            ...result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getPurchaseOrderDetail = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await purchaseOrderService.getPurchaseOrderDetail(id);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const getSuppliersByProductUnit = async (req, res) => {

    try {

        const { productUnitId } = req.params;

        const result = await purchaseOrderService.getSuppliersByProductUnit(
            productUnitId,
            req.user
        );

        res.json({
            success: true,
            data: result
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};



module.exports = {
    createPurchaseOrder,
    updateStatus,
    receiveOrder,
    getPurchaseOrders,
    getPurchaseOrderDetail,
    getSuppliersByProductUnit
};