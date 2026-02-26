const purchaseOrderService = require("../services/InventoryServices/purchaseOrder.service");

/* ==============================
   CREATE PURCHASE ORDER
============================== */
exports.createPurchaseOrder = async (req, res) => {
    try {
        const order = await purchaseOrderService.createPurchaseOrder(
            req.body,
            req.user
        );

        return res.status(201).json({
            success: true,
            data: order
        });

    } catch (err) {
        if (err.message === "PERMISSION_DENIED")
            return res.status(403).json({ success: false, message: "Permission denied" });

        if (err.message === "SUPPLIER_REQUIRED")
            return res.status(400).json({ success: false, message: "Supplier is required" });

        if (err.message === "ITEMS_REQUIRED")
            return res.status(400).json({ success: false, message: "At least one item is required" });

        if (err.message === "INVALID_ITEM_DATA")
            return res.status(400).json({ success: false, message: "Invalid item data" });

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


/* ==============================
   UPDATE STATUS
============================== */
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus } = req.body;

        if (!newStatus) {
            return res.status(400).json({
                success: false,
                message: "newStatus is required"
            });
        }

        const result = await purchaseOrderService.updateStatus(
            parseInt(id),
            newStatus,
            req.user
        );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (err) {
        if (err.message === "PERMISSION_DENIED")
            return res.status(403).json({ success: false, message: "Permission denied" });

        if (err.message === "INVALID_TRANSITION")
            return res.status(400).json({ success: false, message: "Invalid status transition" });

        if (err.message === "PO_NOT_FOUND")
            return res.status(404).json({ success: false, message: "Purchase order not found" });

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


/* ==============================
   GET DETAIL
============================== */
exports.getDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await purchaseOrderService.getDetail(parseInt(id));

        return res.status(200).json({
            success: true,
            data
        });

    } catch (err) {

        if (err.message === "PO_NOT_FOUND")
            return res.status(404).json({ success: false, message: "Purchase order not found" });

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


/* ==============================
   GET LIST
============================== */
exports.getList = async (req, res) => {
    try {

        const result = await purchaseOrderService.getList(req.query);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


/* ==============================
   PO MONTHLY REPORT
============================== */
exports.getMonthlyReport = async (req, res) => {
    try {
        let { month, year, supplierId } = req.query;

        const now = new Date();

        if (!month) month = now.getMonth() + 1;
        if (!year) year = now.getFullYear();

        const result = await purchaseOrderService.getMonthlyReport({
            month: parseInt(month),
            year: parseInt(year),
            supplierId: supplierId ? parseInt(supplierId) : null
        });

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};