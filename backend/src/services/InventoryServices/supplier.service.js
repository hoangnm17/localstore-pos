const supplierModel = require("../../models/supplier.model.js");

/* ==============================
   GET SUPPLIER LIST
============================== */
exports.getSupplierList = async (query) => {

    const {
        search
    } = query;

    const suppliers = await supplierModel.getList({
        search
    });

    return suppliers;
};
/* ==============================
   GET SUPPLIER BY ID
============================== */
exports.getSupplierById = async (id) => {

    if (!id) {
        throw new Error("SUPPLIER_ID_REQUIRED");
    }

    const supplier = await supplierModel.getById(id);

    if (!supplier) {
        throw new Error("SUPPLIER_NOT_FOUND");
    }

    return supplier;
};