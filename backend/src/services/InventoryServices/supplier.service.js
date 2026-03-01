const supplierModel = require("../../models/supplier.model.js");

const getSupplierList = async (query) => {

    const {
        search
    } = query;

    const suppliers = await supplierModel.getList({
        search
    });

    return suppliers;
};

const getSupplierById = async (id) => {

    if (!id) {
        throw new Error("SUPPLIER_ID_REQUIRED");
    }

    const supplier = await supplierModel.getById(id);

    if (!supplier) {
        throw new Error("SUPPLIER_NOT_FOUND");
    }

    return supplier;
};

const getProductsBySupplier = async (supplierId) => {
    if (!supplierId) {
        throw new Error("SUPPLIER_ID_REQUIRED");
    }

    return await supplierModel.getProductsBySupplier(supplierId);
};

const getProductsNotInSupplier = async (supplierId, query) => {
    if (!supplierId) {
        throw new Error("SUPPLIER_ID_REQUIRED");
    }

    const { search } = query;

    return await supplierModel.getProductsNotInSupplier(
        supplierId,
        search
    );
};

const addProductToSupplier = async (supplierId, body) => {

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

const createSupplier = async (body) => {

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

const updateProductOfSupplier = async (
    supplierId,
    productId,
    body
) => {

    if (!supplierId) {
        throw new Error("SUPPLIER_ID_REQUIRED");
    }

    if (!productId) {
        throw new Error("PRODUCT_ID_REQUIRED");
    }

    const { supplyPrice, status } = body;

    if (supplyPrice == null || !status) {
        throw new Error("PRICE_AND_STATUS_REQUIRED");
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        throw new Error("INVALID_STATUS");
    }

    await supplierModel.updateProductOfSupplier(
        supplierId,
        productId,
        supplyPrice,
        status
    );
};

module.exports = {
    getSupplierList,
    getSupplierById,
    getProductsBySupplier,
    getProductsNotInSupplier,
    addProductToSupplier,
    createSupplier,
    updateProductOfSupplier
}