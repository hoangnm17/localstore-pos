const sql = require("mssql");
const { connectDB } = require("../config/database");
const crypto = require("crypto")
const invoiceModel = require("../models/invoice.model");

const runInTransaction = async (callback) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const result = await callback(transaction);
        await transaction.commit();
        return result;
    } catch (err) {
        try {
            await transaction.rollback();
        } catch (_) { }
        throw err;
    }
};

const generateInvoiceCode = (invoiceId) => {
    const now = new Date();
    const date =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    return `INV${date}-${String(invoiceId).padStart(6, "0")}`;
};

const validateItems = (items) => {

    if (!Array.isArray(items))
        throw new Error("Items must be array");

    for (const item of items) {
        if (!item?.productId || item.quantity <= 0) {
            throw new Error("Invalid item format");
        }
    }
};

const getAllInvoice = async ({ page, pageSize, status, invoiceCode } = {}) => {
    return invoiceModel.getInvoiceList({
        page,
        pageSize,
        status,
        invoiceCode
    });
};

const createInvoice = async ({ items, staffId, counterId, customerId }) => {
    if (!staffId) throw new Error("Invalid staff");

    validateItems(items);

    return runInTransaction(async (transaction) => {

        let invoiceCode = `INV-${crypto.randomUUID()}`;
        const invoiceId = await invoiceModel.insertInvoice(transaction, {
            staffId,
            invoiceCode,
            counterId,
            customerId,
        });

        invoiceCode = generateInvoiceCode(invoiceId);
        await invoiceModel.updateInvoiceCode(transaction, invoiceId, invoiceCode);

        let totalAmount = 0;

        for (const item of items) {
            const product = await invoiceModel.getProductById(transaction, item.productId, item.productUnitId);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            const unitPrice = product.salePrice;
            const lineTotal = unitPrice * item.quantity;
            const baseQuantity = item.quantity * product.conversionFactor;

            totalAmount += lineTotal;

            await invoiceModel.insertInvoiceItem(transaction, {
                invoiceId,
                productId: item.productId,
                productName: product.name,
                quantity: item.quantity,
                unitPrice,
                lineTotal,
                productUnitId: item.productUnitId,
                unitName: product.unitName,
                baseQuantity,
            });
        }

        await invoiceModel.updateAmounts(transaction, invoiceId, {
            totalAmount,
            finalAmount: totalAmount,
        });

        return { id: invoiceId, invoiceCode };
    });
};

const updateInvoiceItems = async (id, { items }) => {

    return runInTransaction(async (transaction) => {

        validateItems(items);

        await invoiceModel.deleteInvoiceItems(transaction, id);

        let totalAmount = 0;

        for (const item of items) {
            const product = await invoiceModel.getProductById(transaction, item.productId, item.productUnitId);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            const unitPrice = product.salePrice;
            const lineTotal = unitPrice * item.quantity;
            const baseQuantity = item.quantity * product.conversionFactor;

            totalAmount += lineTotal;
            await invoiceModel.insertInvoiceItem(transaction, {
                invoiceId: id,
                productId: item.productId,
                productName: product.name,
                quantity: item.quantity,
                unitPrice,
                lineTotal,
                productUnitId: item.productUnitId,
                unitName: product.unitName,
                baseQuantity,
            });

        }

        await invoiceModel.updateAmounts(transaction, id, {
            totalAmount,
            finalAmount: totalAmount
        });

        return { updated: true };

    });

};

const cancelInvoice = async (id) => {

    return runInTransaction(async (transaction) => {

        await getEditableInvoice(transaction, id);

        await invoiceModel.updateStatus(
            transaction,
            id,
            "CANCELLED"
        );

        return { cancelled: true };

    });

};

const getDraftInvoices = async () => {
    return invoiceModel.getDraftInvoices();
};

const getInvoiceDetail = async (id) => {
    const invoice = await invoiceModel.getInvoiceDetail(id);
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
};

const updateInvoiceCustomer = async (
    id,
    { customerId } = {}
) => {
    return runInTransaction(async (transaction) => {

        const invoice = await invoiceModel.getInvoiceById(
            transaction,
            id,
            { forUpdate: true }
        );

        if (!invoice) {
            throw new Error("Invoice not found");
        }

        if (["PAID", "CANCELLED"].includes(invoice.status)) {
            throw new Error("Cannot update this invoice");
        }


        if (customerId !== undefined) {

            if (customerId !== null) {
                const customer = await invoiceModel.getCustomerById(
                    transaction,
                    customerId
                );

                if (!customer) {
                    throw new Error("Customer not found");
                }
            }
            await invoiceModel.updateCustomer(
                transaction,
                id,
                customerId
            );
        }

    });
};

module.exports = {
    getAllInvoice,
    createInvoice,
    getDraftInvoices,
    getInvoiceDetail,
    updateInvoiceCustomer,
    updateInvoiceItems,
    cancelInvoice,
};