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
    const data = await invoiceModel.getInvoiceDetail(id);
    if (!data) throw new Error("Invoice not found");

    return {
        id: Number(data.id),
        invoiceCode: data.invoiceCode,
        createdAt: data.createdAt,
        finalAmount: Number(data.finalAmount) || 0,
        status: data.status,
        customerId: data.customerId ? Number(data.customerId) : null,
        customerName: data.customerName,
        staffName: data.staffName,
        counterName: data.counterName,
        items: data.items.map(item => {
            const factor = Number(item.factor) || 1;
            return {
                ...item,
                id: Number(item.id),
                productId: Number(item.productId),
                productUnitId: Number(item.productUnitId),
                quantity: Number(item.quantity) || 0,
                unitPrice: Number(item.unitPrice) || 0,
                lineTotal: Number(item.lineTotal) || 0,
                factor: factor,
                quantityOnHand: Math.floor(
                    (Number(item.quantityOnHand) || 0) / (Number(item.factor) || 1)
                )
            };
        })
    };
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

/* =====================================================
   TỰ ĐỘNG ĐỒNG BỘ CA LÀM THEO FILE CONFIG
===================================================== */
const syncCounter = async (userId, configCounterId) => {
    const data = await invoiceModel.getStaffAndSchedule(userId);
    if (!data)
        throw new Error("Tài khoản chưa được liên kết với nhân viên!");
    const { staffId, roleName, schedule } = data;

    if (schedule) {
        if (schedule.counterId !== null &&
            String(schedule.counterId) !== String(configCounterId)) {
            const machineName = await invoiceModel.getCounterName(configCounterId);
            const assignedName = schedule.counterName || `Quầy khác`;

            const err = new Error(`
                Bạn được phân công làm việc tại "${assignedName}"
                . Không thể bán hàng tại máy của "${machineName}"!`);
            err.statusCode = 400;
            throw err;
        }

        await invoiceModel.checkInSchedule(schedule.id);
    } else {
        if (roleName === 'Cashier') {
            const err = new Error("Bạn không có lịch làm việc hôm nay. Vui lòng liên hệ Quản lý!");
            err.statusCode = 400;
            throw err;
        }
        const machineName = await invoiceModel.getCounterName(configCounterId);
        await invoiceModel.createManagerSchedule(staffId, configCounterId, machineName);
    }

    return { staffId, counterId: configCounterId };
};
module.exports = {
    getAllInvoice,
    createInvoice,
    getDraftInvoices,
    getInvoiceDetail,
    updateInvoiceCustomer,
    updateInvoiceItems,
    cancelInvoice,
    syncCounter,
};