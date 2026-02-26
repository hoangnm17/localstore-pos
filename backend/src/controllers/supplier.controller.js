const supplierService = require("../services/InventoryServices/supplier.service");

/* ==============================
   GET SUPPLIER LIST
============================== */
exports.getSupplierList = async (req, res) => {
    try {

        const suppliers = await supplierService.getSupplierList(req.query);

        return res.status(200).json({
            success: true,
            data: suppliers
        });

    } catch (err) {

        console.error("GET_SUPPLIER_LIST_ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
/* ==============================
   GET SUPPLIER DETAIL
============================== */
exports.getSupplierDetail = async (req, res) => {
    try {

        const { id } = req.params;

        const supplier = await supplierService.getSupplierById(parseInt(id));

        return res.status(200).json({
            success: true,
            data: supplier
        });

    } catch (err) {

        if (err.message === "SUPPLIER_ID_REQUIRED")
            return res.status(400).json({ success: false, message: "Supplier ID is required" });

        if (err.message === "SUPPLIER_NOT_FOUND")
            return res.status(404).json({ success: false, message: "Supplier not found" });

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};