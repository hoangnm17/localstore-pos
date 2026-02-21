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

        res.status(201).json({
            message: "Purchase order created successfully",
            data: order
        });

    } catch (err) {

        if (err.message === "PERMISSION_DENIED")
            return res.status(403).json({ message: "Permission denied" });

        if (err.message === "SUPPLIER_REQUIRED")
            return res.status(400).json({ message: "Supplier is required" });

        if (err.message === "ITEMS_REQUIRED")
            return res.status(400).json({ message: "At least one item is required" });

        if (err.message === "INVALID_ITEM_DATA")
            return res.status(400).json({ message: "Invalid item data" });

        res.status(500).json({ message: err.message });
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
            return res.status(400).json({ message: "newStatus is required" });
        }

        const result = await purchaseOrderService.updateStatus(
            parseInt(id),
            newStatus,
            req.user
        );

        res.json({
            message: "Status updated successfully",
            data: result
        });

    } catch (err) {

        if (err.message === "PERMISSION_DENIED")
            return res.status(403).json({ message: "Permission denied" });

        if (err.message === "INVALID_TRANSITION")
            return res.status(400).json({ message: "Invalid status transition" });

        if (err.message === "PO_NOT_FOUND")
            return res.status(404).json({ message: "Purchase order not found" });

        res.status(500).json({ message: err.message });
    }
};

exports.getDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await purchaseOrderService.getDetail(
            parseInt(id)
        );

        res.json({
            message: "Purchase order detail",
            data
        });

    } catch (err) {

        if (err.message === "PO_NOT_FOUND")
            return res.status(404).json({ message: "Purchase order not found" });

        res.status(500).json({ message: err.message });
    }
};