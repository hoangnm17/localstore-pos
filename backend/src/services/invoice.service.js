const sql = require("mssql");
const { connectDB } = require("../config/database");
const invoiceModel = require("../models/invoice.model");
const inventoryService = require("./InventoryServices/inventory.service");


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
    if (!Array.isArray(items)) return;

    for (const item of items) {
        if (!item?.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error("Invalid item format");
        }
    }
};

const getAllInvoice = async ({ page, pageSize } = {}) => {
    return invoiceModel.getInvoiceList({ page, pageSize });
};

const createInvoice = async ({ items, staffId, counterId }) => {
    if (!staffId) throw new Error("Invalid staff");

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Invoice must have items");
    }

    validateItems(items);

    return runInTransaction(async (transaction) => {

        let invoiceCode = `INV-${crypto.randomUUID()}`;
        const invoiceId = await invoiceModel.insertInvoice(transaction, {
            staffId,
            invoiceCode,
            counterId,
        });

        invoiceCode = generateInvoiceCode(invoiceId);
        await invoiceModel.updateInvoiceCode(transaction, invoiceId, invoiceCode);

        let totalAmount = 0;

        for (const item of items) {
            const product = await invoiceModel.getProductById(transaction, item.productId);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            const unitPrice = product.salePrice;
            const lineTotal = unitPrice * item.quantity;

            totalAmount += lineTotal;

            await invoiceModel.insertInvoiceItem(transaction, {
                invoiceId,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice,
                lineTotal,
            });
        }

        await invoiceModel.updateAmounts(transaction, invoiceId, {
            totalAmount,
            finalAmount: totalAmount,
        });

        return { id: invoiceId, invoiceCode };
    });
};

const updateInvoice = async (id, { items, status, payment } = {}) => {
    return runInTransaction(async (transaction) => {

        const invoice = await invoiceModel.getInvoiceById(transaction, id, { forUpdate: true });
        if (!invoice) throw new Error("Invoice not found");

        if (["PAID", "CANCELLED"].includes(invoice.status)) {
            throw new Error("Cannot update this invoice");
        }

        let totalAmount = invoice.totalAmount || 0;

        if (Array.isArray(items)) {
            validateItems(items);

            await invoiceModel.deleteInvoiceItems(transaction, id);

            totalAmount = 0;

            for (const item of items) {
                const product = await invoiceModel.getProductById(transaction, item.productId);
                if (!product) throw new Error(`Product ${item.productId} not found`);

                const unitPrice = product.salePrice;
                const lineTotal = unitPrice * item.quantity;

                totalAmount += lineTotal;

                await invoiceModel.insertInvoiceItem(transaction, {
                    invoiceId: id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice,
                    lineTotal,
                });
            }

            await invoiceModel.updateAmounts(transaction, id, {
                totalAmount,
                finalAmount: totalAmount,
            });
        }

        if (status === "CANCELLED") {
            await invoiceModel.updateStatus(transaction, id, "CANCELLED");
            return { cancelled: true };
        }

        if (status === "PAID") {
            if (!payment?.method) throw new Error("Invalid payment information");

            const payAmount = Number(payment.amount ?? totalAmount);
            if (!Number.isFinite(payAmount) || payAmount <= 0) {
                throw new Error("Invalid payment information");
            }

            const invoiceItems = await invoiceModel.getInvoiceItems(transaction, id);
            if (!invoiceItems.length) throw new Error("Cannot pay empty invoice");

            if (totalAmount <= 0) throw new Error("Cannot pay empty invoice");

            if (payAmount < totalAmount) {
                throw new Error("Payment amount is not enough");
            }

            await inventoryService.deductStock(transaction, invoiceItems);

            await invoiceModel.insertPayment(transaction, {
                invoiceId: id,
                method: payment.method,
                amount: payAmount,
            });

            await invoiceModel.updateStatus(transaction, id, "PAID");

            return { paid: true };
        }

        if (status) {
            await invoiceModel.updateStatus(transaction, id, status);
        }

        return { success: true };
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

module.exports = {
    getAllInvoice,
    createInvoice,
    updateInvoice,
    getDraftInvoices,
    getInvoiceDetail,
};