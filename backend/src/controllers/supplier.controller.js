const supplierService = require("../services/InventoryServices/supplier.service");

const getSupplierList = async (req, res) => {
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

const getSupplierDetail = async (req, res) => {
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

const getSupplierProducts = async (req, res) => {
    console.log("PARAM ID:", req.params.id);
    try {

        const { id } = req.params;

        const products = await supplierService.getProductsBySupplier(
            parseInt(id)
        );

        return res.status(200).json({
            success: true,
            data: products
        });

    } catch (err) {

        if (err.message === "SUPPLIER_ID_REQUIRED")
            return res.status(400).json({ success: false, message: "Supplier ID is required" });

        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getProductsNotInSupplier = async (req, res) => {
    try {

        const { id } = req.params;

        const products = await supplierService.getProductsNotInSupplier(
            parseInt(id),
            req.query
        );

        return res.status(200).json({
            success: true,
            data: products
        });

    } catch (err) {

        if (err.message === "SUPPLIER_ID_REQUIRED")
            return res.status(400).json({ success: false, message: "Supplier ID is required" });

        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getProductUnits = async (req, res) => {

    try {
        const { productId } = req.params;

        const units = await supplierService.getUnitsByProductId(productId);

        res.json({
            success: true,
            data: units
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const addProductToSupplier = async (req, res) => {
    try {

        const { id } = req.params;

        await supplierService.addProductToSupplier(
            parseInt(id),
            req.body,
            req.user.id
        );

        return res.status(201).json({
            success: true,
            message: "Product added to supplier successfully"
        });

    } catch (err) {
        console.error(err);
        if (err.message === "PRODUCT_UNIT_PRICE_REQUIRED")
            return res.status(400).json({
                success:false,
                message:"Product, unit and price are required"
            });

        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

const createSupplier = async (req, res) => {
    try {

        const supplier = await supplierService.createSupplier(req.body);

        return res.status(201).json({
            success: true,
            data: supplier
        });

    } catch (err) {

        if (err.message === "SUPPLIER_NAME_REQUIRED")
            return res.status(400).json({
                success: false,
                message: "Supplier name is required"
            });

        console.error("CREATE_SUPPLIER_ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updateProductOfSupplier = async (req, res) => {
    try {

        const { id, productId } = req.params;

        await supplierService.updateProductOfSupplier(
            parseInt(id),
            parseInt(productId),
            req.body,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Price updated successfully"
        });

    } catch (err) {

        if (err.message === "PRICE_AND_UNIT_REQUIRED")
            return res.status(400).json({
                success:false,
                message:"Price and unit are required"
            });

        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

const updateSupplier = async (req, res) => {
    try {

        const { id } = req.params;

        const supplier = await supplierService.updateSupplier(
            parseInt(id),
            req.body
        );

        return res.status(200).json({
            success: true,
            data: supplier
        });

    } catch (err) {

        if (err.message === "SUPPLIER_ID_REQUIRED")
            return res.status(400).json({ success: false, message: "Supplier ID is required" });

        if (err.message === "SUPPLIER_NOT_FOUND")
            return res.status(404).json({ success: false, message: "Supplier not found" });

        if (err.message === "SUPPLIER_NAME_REQUIRED")
            return res.status(400).json({ success: false, message: "Supplier name is required" });

        console.error("UPDATE_SUPPLIER_ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getPriceHistoryDetail = async (req, res) => {

    try {

        const { id, productId } = req.params;

        const data = await supplierService.getPriceHistoryDetail(
            parseInt(id),
            parseInt(productId)
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};

module.exports = {
    getSupplierList,
    getSupplierDetail,
    getSupplierProducts,
    getProductsNotInSupplier,
    addProductToSupplier,
    createSupplier,
    updateProductOfSupplier,
    updateSupplier,
    getProductUnits,
    getPriceHistoryDetail
}