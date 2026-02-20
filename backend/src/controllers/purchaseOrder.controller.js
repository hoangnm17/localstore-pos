const purchaseOrderService = require("../services/InventoryServices/purchaseOrder.service");

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

        if (err.message === "PERMISSION_DENIED") {
            return res.status(403).json({ message: "Permission denied" });
        }

        if (err.message === "SUPPLIER_REQUIRED") {
            return res.status(400).json({ message: "Supplier is required" });
        }

        res.status(500).json({ message: err.message });
    }
};