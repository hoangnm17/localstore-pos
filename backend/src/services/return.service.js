const sql = require("mssql");
const { connectDB } = require("../config/database");
const invoiceModel = require("../models/invoice.model");
const returnModel = require("../models/return.model");
const returnItemModel = require("../models/returnItem.model");

const runInTransaction = async (work) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const result = await work(transaction);
        await transaction.commit();
        return result;
    } catch (err) {
        if (transaction._aborted === false) {
            await transaction.rollback();
        }
        throw err;
    }
};


exports.getReturns = async (filters = {}) => {
    const page = Math.max(1, Number(filters.page || 1));
    const pageSize = Math.max(1, Number(filters.pageSize || 20));
    const offset = (page - 1) * pageSize;

    const pool = await connectDB();
    const data = await returnModel.getReturns(pool, {
        status: filters.status,
        pageSize,
        offset
    });

    return {
        page,
        pageSize,
        total: data.total,
        data: data.rows
    };
};

exports.getReturnDetail = async (returnId) => {
    const pool = await connectDB();
    const data = await returnModel.getReturnDetail(pool, returnId);
    if (!data) throw new Error("Return not found");
    return data;
};

exports.createReturn = async (user, payload = {}) => {
    const { invoiceId, reason, items = [] } = payload;
    if (!items.length) throw new Error("Return items required");

    return await runInTransaction(async (transaction) => {

        const invoice = await invoiceModel.getInvoiceId(transaction, invoiceId, { forUpdate: true });
        if (!invoice) throw new Error("Invoice not found");
        if (invoice.status !== "PAID") throw new Error("Invoice must be PAID to return");

        const invoiceItems = await invoiceModel.getInvoiceItems(transaction, invoiceId);
        const itemMap = new Map(invoiceItems.map(i => [Number(i.id), i]));

        let totalRefund = 0;
        const returnItemsData = items.map(item => {
            const invItem = itemMap.get(Number(item.invoiceItemId));
            if (!invItem) throw new Error(`Invalid invoice item ID: ${item.invoiceItemId}`);
            if (item.quantity > invItem.quantity) throw new Error(`Return quantity exceeds purchased for ${invItem.productName}`);

            const refundAmount = item.quantity * invItem.unitPrice;
            totalRefund += refundAmount;

            const ratio = invItem.quantity > 0 ? (invItem.baseQuantity / invItem.quantity) : 0;

            return {
                ...item,
                productId: invItem.productId,
                productUnitId: invItem.productUnitId,
                productName: invItem.productName,
                unitName: invItem.unitName,
                baseQuantity: item.quantity * ratio,
                refundAmount
            };
        });

        const returnId = await returnModel.createReturn(transaction, {
            invoiceId,
            counterId: user.counterId,
            staffId: user.id,
            returnType: "REFUND",
            refundMethod: "CASH",
            totalRefundAmount: totalRefund,
            reason
        });

        await Promise.all(returnItemsData.map(item =>
            returnItemModel.createReturnItem(transaction, returnId, item)
        ));

        return { returnId, totalRefund };
    });
};


exports.approveReturn = async (user, returnId) => {
    return await runInTransaction(async (transaction) => {
        const ret = await returnModel.getReturnById(transaction, returnId);
        if (!ret || ret.status !== "Pending") {
            throw new Error("Only Pending return can be approved");
        }

        await returnModel.updateReturnStatus(transaction, returnId, {
            status: "Approve",
            approveBy: user.id,
            approvedAt: new Date(),
        });

        return { returnId: Number(returnId), status: "Approved" };
    });
};

exports.rejectReturn = async (user, returnId, reason) => {
    return await runInTransaction(async (transaction) => {
        const ret = await returnModel.getReturnById(transaction, returnId);
        if (!ret || ret.status !== "Pending") {
            throw new Error("Only Pending return can be rejected");
        }

        await returnModel.updateReturnStatus(transaction, returnId, {
            status: "Reject",
            approveBy: user.id,
            approvedAt: new Date(),
            rejectReason: reason || null
        });
        await returnItemModel.updateRestockApprovedByReturnId(transaction, returnId, "Cancel");

        return { returnId: Number(returnId), status: "Rejected" };
    });
};
