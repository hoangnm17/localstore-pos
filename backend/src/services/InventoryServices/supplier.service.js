const supplierModel = require("../../models/supplier.model.js");

exports.getSupplierList = async (query) => {

    const {
        search
    } = query;

    const suppliers = await supplierModel.getList({
        search
    });

    return suppliers;
};

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

exports.getProductsBySupplier = async (supplierId) => {
    if (!supplierId) {
        throw new Error("SUPPLIER_ID_REQUIRED");
    }

    return await supplierModel.getProductsBySupplier(supplierId);
};

exports.getProductsNotInSupplier = async (supplierId, query) => {
    if (!supplierId) {
        throw new Error("SUPPLIER_ID_REQUIRED");
    }

    const { search } = query;

    return await supplierModel.getProductsNotInSupplier(
        supplierId,
        search
    );
};

exports.addProductToSupplier = async (supplierId, body) => {

    if (!supplierId) {
        throw new Error("SUPPLIER_ID_REQUIRED");
    }

    const { productId, supplyPrice } = body;

    if (!productId || !supplyPrice) {
        throw new Error("PRODUCT_ID_AND_PRICE_REQUIRED");
    }

    await supplierModel.addProductToSupplier(
        supplierId,
        productId,
        supplyPrice
    );
};

exports.createSupplier = async (body) => {

    const { name, contactInfo, address } = body;

    if (!name || name.trim() === "") {
        throw new Error("SUPPLIER_NAME_REQUIRED");
    }

    return await supplierModel.createSupplier({
        name: name.trim(),
        contactInfo,
        address
    });
};