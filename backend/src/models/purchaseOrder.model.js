const { sql, connectDB } = require("../config/database.js");

/* ==============================
   CREATE PURCHASE ORDER
============================== */
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

        const poResult = await request
            .input("supplierId", sql.Int, supplierId)
            .input("note", sql.NVarChar, note)
            .input("createdBy", sql.BigInt, createdBy)
            .query(`
                INSERT INTO PurchaseOrders 
                (supplierId, note, status, createdBy, createdAt)
                OUTPUT INSERTED.*
                VALUES (@supplierId, @note, 'Pending', @createdBy, GETDATE())
            `);

        const purchaseOrder = poResult.recordset[0];

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


/* ==============================
   GET BY ID
============================== */
exports.getById = async (poId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("poId", sql.Int, poId)
        .query(`
            SELECT * 
            FROM PurchaseOrders 
            WHERE id = @poId
        `);

    return result.recordset[0];
};


/* ==============================
   UPDATE STATUS (NOT RECEIVED)
============================== */
exports.updateStatus = async (poId, newStatus, userId) => {
    const pool = await connectDB();

    if (newStatus === "Approved" || newStatus === "Rejected") {

        await pool.request()
            .input("poId", sql.Int, poId)
            .input("newStatus", sql.VarChar(20), newStatus)
            .input("processBy", sql.BigInt, userId)
            .query(`
                UPDATE PurchaseOrders
                SET status = @newStatus,
                    processBy = @processBy
                WHERE id = @poId
            `);

        return true;
    }

    if (newStatus === "WaitingForDelivery" || newStatus === "CannotDeliver") {

        await pool.request()
            .input("poId", sql.Int, poId)
            .input("newStatus", sql.VarChar(20), newStatus)
            .query(`
                UPDATE PurchaseOrders
                SET status = @newStatus
                WHERE id = @poId
            `);

        return true;
    }

    return true;
};


/* ==============================
   RECEIVE PURCHASE ORDER
============================== */
exports.receivePurchaseOrder = async (poId, userId) => {

    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const itemsRequest = new sql.Request(transaction);

        const itemsResult = await itemsRequest
            .input("poId", sql.Int, poId)
            .query(`
                SELECT productId, quantityOrdered
                FROM PurchaseOrderItems
                WHERE poId = @poId
            `);

        const items = itemsResult.recordset;

        for (const item of items) {

            const stockRequest = new sql.Request(transaction);

            await stockRequest
                .input("productId", sql.BigInt, item.productId)
                .input("qty", sql.Decimal(15, 3), item.quantityOrdered)
                .query(`
                    UPDATE InventoryStocks
                    SET quantityOnHand = quantityOnHand + @qty
                    WHERE productId = @productId
                `);
        }

        const statusRequest = new sql.Request(transaction);

        await statusRequest
            .input("poId", sql.Int, poId)
            .input("receivedBy", sql.BigInt, userId)
            .query(`
                UPDATE PurchaseOrders
                SET status = 'Received',
                    receivedBy = @receivedBy
                WHERE id = @poId
            `);

        await transaction.commit();
        return true;

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};