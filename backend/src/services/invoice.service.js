const sql = require("mssql");
const { connectDB } = require("../config/database");
const invoiceModel = require("../models/invoice.model");
const inventoryService = require("./InventoryServices/inventory.service");
const paymentModel = require("../models/payment.model")
const createVnpayUtil = require("../utils/vnpay.mockup");
const customerModel = require("../models/customer.model");
const voucherModel = require("../models/voucher.model");
const promotionModel = require("../models/promotion.model")
const customerPointLogService = require("./customerPointLog.service")

const POINT_EXCHANGE = 100;
const EARN_POINT_EXCHANGE = 10000;

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

const validateDiscount = async (customerId, discount, totalAmount) => {

    let totalDiscount = 0;

    let pointDiscount = 0;
    let voucherDiscount = 0;
    let promotionDiscount = 0;

    let actualPointUsed = 0;

    /* ===== VOUCHER ===== */

    if (discount.voucherId) {

        const voucher = await voucherModel.getVoucherById(discount.voucherId);

        if (!voucher)
            throw new Error("Voucher not found");

        if (voucher.status !== "Active")
            throw new Error("Voucher is not active");

        if (voucher.currentUsage >= voucher.maxUsage)
            throw new Error("Voucher usage exceeded");

        if (totalAmount < voucher.minOrderValue)
            throw new Error("Voucher condition not satisfied");

        if (voucher.type === "Percent") {
            voucherDiscount = Math.floor(totalAmount * voucher.value / 100);
        } else {
            voucherDiscount = voucher.value;
        }

        voucherDiscount = Math.min(voucherDiscount, totalAmount);

        totalDiscount += voucherDiscount;
    }

    /* ===== PROMOTION ===== */

    if (discount.promotionId) {

        const promotion = await promotionModel.getPromotionById(discount.promotionId);

        if (!promotion)
            throw new Error("Promotion not found");

        if (promotion.status !== "Active")
            throw new Error("Promotion is not active");

        if (promotion.type === "Percent") {
            promotionDiscount = Math.floor(totalAmount * promotion.value / 100);
        } else {
            promotionDiscount = promotion.value;
        }

        const remaining = totalAmount - totalDiscount;

        promotionDiscount = Math.min(promotionDiscount, remaining);

        totalDiscount += promotionDiscount;
    }

    /* ===== POINT ===== */

    if (discount.pointUsed > 0) {

        const customer = await customerModel.getCustomerById(customerId);

        if (!customer)
            throw new Error("Customer not found");

        if (discount.pointUsed > customer.loyaltyPoints)
            throw new Error("Cannot use loyalty point over current point!");

        const rawPointDiscount =
            discount.pointUsed * POINT_EXCHANGE;

        const remaining =
            totalAmount - totalDiscount;

        pointDiscount =
            Math.min(rawPointDiscount, remaining);

        actualPointUsed =
            Math.floor(pointDiscount / POINT_EXCHANGE);

        pointDiscount =
            actualPointUsed * POINT_EXCHANGE;

        totalDiscount += pointDiscount;
    }

    /* ===== FINAL ===== */

    const finalAmount =
        Math.max(totalAmount - totalDiscount, 0);

    return {
        finalAmount,
        totalDiscount,
        pointDiscount,
        voucherDiscount,
        promotionDiscount,
        actualPointUsed
    };
};

const updateInvoice = async (id, { items, status, payment } = {}) => {
    return runInTransaction(async (transaction) => {

        /* ================= LOAD & LOCK ================= */

        const invoice = await invoiceModel.getInvoiceById(
            transaction,
            id,
            { forUpdate: true }
        );

        if (!invoice) throw new Error("Invoice not found");

        if (["PAID", "CANCELLED"].includes(invoice.status))
            throw new Error("Cannot update this invoice");

        let totalAmount = invoice.totalAmount || 0;
        let finalAmount = invoice.finalAmount || 0;

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
                    lineTotal
                });
            }

            finalAmount = totalAmount;

            await invoiceModel.updateAmounts(transaction, id, {
                totalAmount,
                finalAmount
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

            const invoiceItems =
                await invoiceModel.getInvoiceItems(transaction, id);

            if (!invoiceItems.length)
                throw new Error("Cannot pay empty invoice");

            /* ================= APPLY DISCOUNT ================= */

            let totalDiscount = 0;
            let pointDiscount = 0;
            let promotionDiscount = 0;
            let voucherDiscount = 0;
            let actualPointUsed = 0;


            if (payment.discount) {

                const discountResult = await validateDiscount(
                    invoice.customerId,
                    payment.discount,
                    totalAmount
                );
                totalDiscount = discountResult.totalDiscount;
                finalAmount = discountResult.finalAmount;
                pointDiscount = discountResult.pointDiscount;
                promotionDiscount = discountResult.promotionDiscount;
                voucherDiscount = discountResult.voucherDiscount;
                actualPointUsed = discountResult.actualPointUsed;
            } else {
                finalAmount = totalAmount;
            }

            /* ================= PAYMENT VALIDATION ================= */

            const payAmount = Number(payment.amount ?? finalAmount);

            if (!Number.isFinite(payAmount) || payAmount < 0)
                throw new Error("Invalid payment amount");

            if (payAmount < finalAmount)
                throw new Error("Payment amount is not enough");

            /* ================= EXISTING PAYMENT ================= */

            const existingPayment =
                await invoiceModel.getPaymentByInvoiceId(
                    transaction,
                    id
                );

            /* ================= CASH PAYMENT ================= */

            if (payment.method === "CASH") {

                if (!existingPayment) {

                    await invoiceModel.insertPayment(transaction, {
                        invoiceId: id,
                        paymentMethod: "CASH",
                        amount: finalAmount,
                        status: "SUCCESS"
                    });

                } else {

                    await paymentModel.updatePaymentStatus(
                        transaction,
                        id,
                        "SUCCESS"
                    );

                }

                /* ===== APPLY DISCOUNT EFFECT ===== */

                if (actualPointUsed) {

                    await customerPointLogService.adjustPoints(
                        transaction,
                        invoice.customerId,
                        invoice.id,
                        -actualPointUsed,
                        "REDEEM"
                    );

                }

                if (payment.discount?.voucherId) {

                    await voucherModel.increaseUsage(
                        transaction,
                        payment.discount.voucherId
                    );

                }

                /* ===== EARN POINT ===== */

                const earnedPoints =
                    Math.floor(finalAmount / EARN_POINT_EXCHANGE);

                if (earnedPoints > 0) {

                    await customerPointLogService.adjustPoints(
                        transaction,
                        invoice.customerId,
                        invoice.id,
                        earnedPoints,
                        "EARN"
                    );

                }

                /* ===== UPDATE INVOICE ===== */

                await invoiceModel.updateInvoiceDiscount(
                    transaction,
                    invoice.id,
                    payment.discount.promotionId,
                    promotionDiscount,
                    payment.discount.voucherId,
                    voucherDiscount,
                    payment.discount.usedPoints,
                    pointDiscount,
                )

                await invoiceModel.updateAmounts(transaction, id, {
                    totalAmount,
                    finalAmount
                });

                await inventoryService.deductStock(transaction, invoiceItems);

                await invoiceModel.updateStatus(transaction, id, "PAID");

                return { paid: true };

            }

            /* ================= QR PAYMENT ================= */

            if (payment.method === "QR_VNPAY") {

                if (!existingPayment) {

                    await invoiceModel.insertPayment(transaction, {
                        invoiceId: id,
                        paymentMethod: "QR_VNPAY",
                        amount: finalAmount,
                        status: "PENDING"
                    });

                }

                const paymentUrl =
                    vnpayUtil.generatePayUrl(id, finalAmount);

                return {
                    pending: true,
                    paymentUrl
                };
            }

            throw new Error("Unsupported payment method");
        }

        /* ================= UPDATE STATUS ================= */

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