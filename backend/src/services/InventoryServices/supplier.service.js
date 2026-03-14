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

const getUnitsByProductId = async (productId) => {

    if (!productId) {
        throw new Error("ProductId is required");
    }

    const units = await supplierModel.getUnitsByProductId(productId);

    return units;
};

const addProductToSupplier = async (supplierId, body, userId) => {

    if (!supplierId) {
        throw new Error("SUPPLIER_ID_REQUIRED");
    }

    const { productId, price, productUnitId } = body;

    if (!productId || !price || !productUnitId) {
        throw new Error("PRODUCT_UNIT_PRICE_REQUIRED");
    }

    await supplierModel.addProductToSupplier(
        supplierId,
        productId,
        price,
        productUnitId,
        userId
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
    body,
    userId
) => {

    const { price, productUnitId, status } = body;

    // update status
    if (status) {
        await supplierModel.updateProductSupplierStatus(
            supplierId,
            productId,
            status
        );
    }

    // chỉ insert khi có price
    if (price && productUnitId) {
        await supplierModel.updateProductOfSupplierPrice(
            supplierId,
            productId,
            price,
            productUnitId,
            userId
        );
    }
};

const updateSupplier = async (id, body) => {

    if (!id) {
        throw new Error("SUPPLIER_ID_REQUIRED");
    }

    const { name, contactInfo, address } = body;

    if (!name || name.trim() === "") {
        throw new Error("SUPPLIER_NAME_REQUIRED");
    }

    const supplier = await supplierModel.getById(id);

    if (!supplier) {
        throw new Error("SUPPLIER_NOT_FOUND");
    }

    return await supplierModel.updateSupplier(
        id,
        name.trim(),
        contactInfo,
        address
    );
};

const getPriceHistoryDetail = async (supplierId, productId) => {

    return await supplierModel.getPriceHistoryDetail(
        supplierId,
        productId
    );

};

module.exports = {
    getSupplierList,
    getSupplierById,
    getProductsBySupplier,
    getProductsNotInSupplier,
    addProductToSupplier,
    createSupplier,
    updateProductOfSupplier,
    updateSupplier,
    getUnitsByProductId,
    getPriceHistoryDetail
}