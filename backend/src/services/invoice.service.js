const sql = require("mssql");
const { connectDB } = require("../config/database");
const invoiceModel = require("../models/invoice.model");
const inventoryService = require("./InventoryServices/inventory.service");
const createVnpayUtil = require("../utils/vnpay.mockup");

const vnpayUtil = createVnpayUtil({
    secretKey: "MOCK_SECRET",
});


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

const getAllInvoice = async ({ page, pageSize, status } = {}) => {
    return invoiceModel.getInvoiceList({
        page,
        pageSize,
        status
    });
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
                productName: product.name,
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

const updateInvoice = async (id, { items, status, payment, customerId } = {}) => {
    return runInTransaction(async (transaction) => {

        /* ================= LOAD & LOCK ================= */

        const invoice = await invoiceModel.getInvoiceById(
            transaction,
            id,
            { forUpdate: true }
        );

        if (!invoice) throw new Error("Invoice not found");

        if (["PAID", "CANCELLED"].includes(invoice.status)) {
            throw new Error("Cannot update this invoice");
        }

        let totalAmount = invoice.finalAmount || 0;

        /* ================= UPDATE ITEMS ================= */

        if (Array.isArray(items)) {

            validateItems(items);

            await invoiceModel.deleteInvoiceItems(transaction, id);

            totalAmount = 0;

            for (const item of items) {

                const product = await invoiceModel.getProductById(
                    transaction,
                    item.productId
                );

                if (!product)
                    throw new Error(`Product ${item.productId} not found`);

                const unitPrice = product.salePrice;
                const lineTotal = unitPrice * item.quantity;

                totalAmount += lineTotal;

                await invoiceModel.insertInvoiceItem(transaction, {
                    invoiceId: id,
                    productId: item.productId,
                    productName: product.name,
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

        /* ================= CANCEL ================= */

        if (status === "CANCELLED") {
            await invoiceModel.updateStatus(transaction, id, "CANCELLED");
            return { cancelled: true };
        }

        /* ================= PAY ================= */

        if (status === "PAID") {

            if (!payment?.method)
                throw new Error("Invalid payment information");

            const payAmount = Number(payment.amount ?? totalAmount);

            if (!Number.isFinite(payAmount) || payAmount <= 0)
                throw new Error("Invalid payment amount");

            if (payAmount < totalAmount)
                throw new Error("Payment amount is not enough");

            const invoiceItems =
                await invoiceModel.getInvoiceItems(transaction, id);

            if (!invoiceItems.length)
                throw new Error("Cannot pay empty invoice");

            /* ===== CHECK EXISTING PAYMENT ===== */

            const existingPayment =
                await invoiceModel.getPaymentByInvoiceId(
                    transaction,
                    id
                );

            /* ================= CASH ================= */

            if (payment.method === "CASH") {

                if (!existingPayment) {
                    await invoiceModel.insertPayment(transaction, {
                        invoiceId: id,
                        paymentMethod: "CASH",
                        amount: payAmount,
                        status: "SUCCESS",
                    });
                } else {
                    await invoiceModel.updatePaymentStatus(
                        transaction,
                        id,
                        "SUCCESS"
                    );
                }

                await inventoryService.deductStock(transaction, invoiceItems);

                await invoiceModel.updateStatus(transaction, id, "PAID");

                return { paid: true };
            }

            /* ================= QR_VNPAY ================= */

            if (payment.method === "QR_VNPAY") {

                if (!existingPayment) {
                    await invoiceModel.insertPayment(transaction, {
                        invoiceId: id,
                        paymentMethod: "QR_VNPAY",
                        amount: totalAmount,
                        status: "PENDING",
                    });
                }

                const paymentUrl =
                    vnpayUtil.generatePayUrl(id, totalAmount);

                return {
                    pending: true,
                    paymentUrl
                };
            }

            throw new Error("Unsupported payment method");
        }

        /* ================= OTHER STATUS ================= */

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

const updateInvoiceCustomer = async (
    id,
    { items, status, payment, customerId } = {}
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
    updateInvoice,
    getDraftInvoices,
    getInvoiceDetail,
    updateInvoiceCustomer,
};