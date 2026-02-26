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