const { sql, connectDB } = require("../config/database.js");

exports.createPurchaseOrderWithItems = async ({
    supplierId,
    note,
    createdBy,
    items
}) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const request = new sql.Request(transaction);

        // 1️⃣ Insert PO
        const poResult = await request
            .input("supplierId", sql.Int, supplierId)
            .input("note", sql.NVarChar, note)
            .input("createdBy", sql.Int, createdBy)
            .query(`
                INSERT INTO PurchaseOrders (supplierId, note, status, createdBy, createdAt)
                OUTPUT INSERTED.*
                VALUES (@supplierId, @note, 'Pending', @createdBy, GETDATE())
            `);

        const purchaseOrder = poResult.recordset[0];

        // 2️⃣ Insert Items với tồn kho thật
        for (const item of items) {

            const stockRequest = new sql.Request(transaction);

            const stockResult = await stockRequest
                .input("productId", sql.BigInt, item.productId)
                .query(`
                    SELECT quantityOnHand
                    FROM InventoryStocks
                    WHERE productId = @productId
                `);

            if (stockResult.recordset.length === 0) {
                throw new Error("PRODUCT_NOT_FOUND");
            }

            const quantityBefore = stockResult.recordset[0].quantityOnHand;

            const itemRequest = new sql.Request(transaction);

            await itemRequest
                .input("poId", sql.Int, purchaseOrder.id)
                .input("productId", sql.BigInt, item.productId)
                .input("quantityBeforeOrdered", sql.Decimal(15, 3), quantityBefore)
                .input("quantityOrdered", sql.Int, item.quantityOrdered)
                .query(`
                    INSERT INTO PurchaseOrderItems
                    (poId, productId, quantityBeforeOrdered, quantityOrdered)
                    VALUES (@poId, @productId, @quantityBeforeOrdered, @quantityOrdered)
                `);
        }

        await transaction.commit();
        return purchaseOrder;

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};