const sql = require("mssql");
const { connectDB } = require("../config/database");
const invoiceModel = require("../models/invoice.model");
const returnModel = require("../models/return.model");
const returnItemModel = require("../models/returnItem.model");
const inventoryService = require("./InventoryServices/inventory.service");

exports.createReturn = async (user, { invoiceId, reason, items }) => {

    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {

        await transaction.begin();

        /* ================= GET INVOICE ================= */

        const invoice = await invoiceModel.getInvoiceById(
            transaction,
            invoiceId,
            { forUpdate: true }
        );

        if (!invoice)
            throw new Error("Invoice not found");

        if (invoice.status !== "PAID")
            throw new Error("Invoice must be PAID to return");

        /* ================= GET INVOICE ITEMS ================= */

        const invoiceItems = await invoiceModel.getInvoiceItems(
            transaction,
            invoiceId
        );

        const itemMap = new Map();
        invoiceItems.forEach(i => itemMap.set(i.id, i));

        let totalRefund = 0;

        const returnItems = [];

        for (const item of items) {

            const invItem = itemMap.get(item.invoiceItemId);

            if (!invItem)
                throw new Error("Invalid invoice item");

            if (item.quantity > invItem.quantity)
                throw new Error("Return quantity exceeds purchased");

            const refundAmount = item.quantity * invItem.unitPrice;

            totalRefund += refundAmount;

            returnItems.push({
                invoiceItemId: invItem.id,
                productId: invItem.productId,
                productUnitId: invItem.productUnitId,
                productName: invItem.productName,
                unitName: invItem.unitName,
                quantity: item.quantity,
                baseQuantity: item.quantity * invItem.factor,
                refundAmount
            });

        }

        /* ================= CREATE RETURN ================= */

        const returnId = await returnModel.createReturn(
            transaction,
            {
                invoiceId,
                counterId: invoice.counterId,
                staffId: user.id,
                returnType: "REFUND",
                refundMethod: "CASH",
                totalRefundAmount: totalRefund,
                reason
            }
        );

        /* ================= CREATE RETURN ITEMS ================= */

        for (const item of returnItems) {

            await returnItemModel.createReturnItem(
                transaction,
                returnId,
                item
            );

            /* ================= RESTOCK ================= */

            await inventoryService.addStock(
                transaction,
                item.productId,
                item.baseQuantity
            );

        }

        await transaction.commit();

        return {
            returnId,
            totalRefund
        };

    } catch (err) {

        await transaction.rollback();
        throw err;

    }

};