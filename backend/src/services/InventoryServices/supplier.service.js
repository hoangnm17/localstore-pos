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