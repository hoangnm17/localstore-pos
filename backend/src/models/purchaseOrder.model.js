const { sql, connectDB } = require("../config/database.js");

const createPurchaseOrder = async (createdBy, supplierId, note) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("createdBy", sql.BigInt, createdBy)
        .input("supplierId", sql.Int, supplierId)
        .input("note", sql.NVarChar, note)
        .query(`
            INSERT INTO PurchaseOrders
            (
                createdBy,
                supplierId,
                note,
                status
            )
            OUTPUT INSERTED.id
            VALUES
            (
                @createdBy,
                @supplierId,
                @note,
                'Pending'
            )
        `);

    return result.recordset[0];
};

const createPurchaseOrderItem = async (
    poId,
    productUnitId,
    quantity,
    costPrice
) => {

    const pool = await connectDB();

    await pool.request()
        .input("poId", sql.Int, poId)
        .input("productUnitId", sql.Int, productUnitId)
        .input("quantity", sql.Decimal(15, 3), quantity)
        .input("costPrice", sql.Decimal(15, 2), costPrice)
        .query(`
            INSERT INTO PurchaseOrderItems
            (
                poId,
                productUnitId,
                quantity,
                costPrice
            )
            VALUES
            (
                @poId,
                @productUnitId,
                @quantity,
                @costPrice
            )
        `);
};

const getSupplierPrice = async (supplierId, unitId) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("supplierId", sql.Int, supplierId)
        .input("unitId", sql.Int, unitId)
        .query(`
            SELECT TOP 1 price
            FROM SupplierProductPrices
            WHERE supplierId = @supplierId
            AND unitId = @unitId
            ORDER BY createdAt DESC
        `);

    return result.recordset[0];
};

const updatePurchaseOrderTotal = async (poId, totalAmount) => {

    const pool = await connectDB();

    await pool.request()
        .input("poId", sql.Int, poId)
        .input("totalAmount", sql.Decimal(18, 2), totalAmount)
        .query(`
            UPDATE PurchaseOrders
            SET totalAmount = @totalAmount
            WHERE id = @poId
        `);
};

const getPurchaseOrderItems = async (poId) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("poId", sql.Int, poId)
        .query(`
            SELECT
                poi.id,
                pu.productId,
                p.name as productName,
                poi.productUnitId,
                pu.unitName,
                poi.quantity,
                poi.receivedQuantity,
                poi.costPrice
            FROM PurchaseOrderItems poi
            JOIN ProductUnits pu ON pu.id = poi.productUnitId
            JOIN Products p ON p.id = pu.productId
            WHERE poi.poId = @poId
        `);

    return result.recordset;

};

const updateStatus = async (poId, status, userId) => {

    const pool = await connectDB();

    await pool.request()
        .input("poId", sql.Int, poId)
        .input("status", sql.NVarChar, status)
        .input("userId", sql.BigInt, userId)
        .query(`
            UPDATE PurchaseOrders
            SET
                status = @status,
                processBy = @userId,
                totalAmount = CASE 
                    WHEN @status IN ('Rejected','CannotDeliver') THEN 0
                    ELSE totalAmount
                END
            WHERE id = @poId
        `);

    return { poId, status };
};

const receiveOrder = async (poId, items, status, userId) => {

    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {

        await transaction.begin();

        for (const item of items) {

            const unitResult = await new sql.Request(transaction)
                .input("poiId", sql.Int, item.poiId)
                .query(`
                    SELECT 
                        poi.productUnitId,
                        pu.productId,
                        pu.conversionFactor
                    FROM PurchaseOrderItems poi
                    JOIN ProductUnits pu 
                        ON poi.productUnitId = pu.id
                    WHERE poi.id = @poiId
                `);

            if (unitResult.recordset.length === 0) {
                throw new Error("PO_ITEM_NOT_FOUND");
            }

            const unit = unitResult.recordset[0];

            const baseQuantity =
                item.receivedQuantity * unit.conversionFactor;

            //update received quantity
            await new sql.Request(transaction)
                .input("receivedQuantity", sql.Decimal(15,3), item.receivedQuantity)
                .input("poiId", sql.Int, item.poiId)
                .query(`
                    UPDATE PurchaseOrderItems
                    SET receivedQuantity = receivedQuantity + @receivedQuantity
                    WHERE id = @poiId
                `);

            // update inventory
            await new sql.Request(transaction)
                .input("productId", sql.BigInt, unit.productId)
                .input("quantity", sql.Decimal(15,3), baseQuantity)
                .query(`
                    MERGE InventoryStocks AS target
                    USING (SELECT @productId AS productId) AS source
                    ON target.productId = source.productId
                    WHEN MATCHED THEN
                        UPDATE SET quantityOnHand = quantityOnHand + @quantity
                    WHEN NOT MATCHED THEN
                        INSERT (productId, quantityOnHand)
                        VALUES (@productId, @quantity);
                `);

        }

        // update total amount
        await new sql.Request(transaction)
            .input("poId", sql.Int, poId)
            .query(`
                UPDATE PurchaseOrders
                SET totalAmount = (
                    SELECT SUM(receivedQuantity * costPrice)
                    FROM PurchaseOrderItems
                    WHERE poId = @poId
                )
                WHERE id = @poId
            `);

        // update status
        await new sql.Request(transaction)
            .input("status", sql.NVarChar, status)
            .input("userId", sql.BigInt, userId)
            .input("poId", sql.Int, poId)
            .query(`
                UPDATE PurchaseOrders
                SET
                    status = @status,
                    receivedBy = @userId
                WHERE id = @poId
            `);

        await transaction.commit();

        return { poId, status };

    } catch (error) {

        await transaction.rollback();
        throw error;

    }

};

const getPurchaseOrderById = async (poId) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("poId", sql.Int, poId)
        .query(`
            SELECT
                po.id,
                po.status,
                po.note,
                po.totalAmount,
                po.createdAt,

                po.createdBy,
                creator.fullName AS createdByName,

                po.processBy,
                processor.fullName AS processByName,

                po.receivedBy,
                receiver.fullName AS receivedByName,

                po.supplierId,
                s.name AS supplierName

            FROM PurchaseOrders po

            LEFT JOIN Staff creator 
                ON creator.id = po.createdBy

            LEFT JOIN Staff processor 
                ON processor.id = po.processBy

            LEFT JOIN Staff receiver 
                ON receiver.id = po.receivedBy

            LEFT JOIN Suppliers s 
                ON s.id = po.supplierId

            WHERE po.id = @poId
        `);

    return result.recordset[0];

};

const getPurchaseOrders = async (offset, limit, filters) => {

    const pool = await connectDB();

    let query = `
        SELECT 
            po.*,
            s.name AS supplierName,
            u1.fullName AS createdByName,
            u2.fullName AS processByName,
            u3.fullName AS receivedByName
        FROM PurchaseOrders po
        LEFT JOIN Suppliers s ON po.supplierId = s.id
        LEFT JOIN Staff u1 ON po.createdBy = u1.id
        LEFT JOIN Staff u2 ON po.processBy = u2.id
        LEFT JOIN Staff u3 ON po.receivedBy = u3.id
        WHERE 1=1
    `;

    const request = pool.request();

    if (filters.status) {
        query += " AND po.status = @status";
        request.input("status", sql.VarChar, filters.status);
    }

    if (filters.fromDate) {
        query += " AND po.createdAt >= @fromDate";
        request.input("fromDate", sql.DateTime2, filters.fromDate);
    }

    if (filters.toDate) {
        query += " AND po.createdAt <= @toDate";
        request.input("toDate", sql.DateTime2, filters.toDate);
    }

    query += `
        ORDER BY po.createdAt DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
    `;

    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, limit);

    const result = await request.query(query);

    return result.recordset;
};

const countPurchaseOrders = async (filters) => {

    const pool = await connectDB();

    let query = `
        SELECT COUNT(*) as total
        FROM PurchaseOrders
        WHERE 1=1
    `;

    const request = pool.request();

    if (filters.status) {
        query += " AND status = @status";
        request.input("status", sql.VarChar, filters.status);
    }

    if (filters.fromDate) {
        query += " AND createdAt >= @fromDate";
        request.input("fromDate", sql.DateTime2, filters.fromDate);
    }

    if (filters.toDate) {
        query += " AND createdAt <= @toDate";
        request.input("toDate", sql.DateTime2, filters.toDate);
    }

    const result = await request.query(query);

    return result.recordset[0].total;

};

const getSuppliersByProductUnit = async (productUnitId) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("productUnitId", sql.Int, productUnitId)
        .query(`
            SELECT
                s.id AS supplierId,
                s.name AS supplierName,

                pu.id AS productUnitId,
                p.name AS productName,
                pu.unitName,

                spp.price,
                spp.createdAt

            FROM ProductUnits pu

            JOIN Products p
                ON p.id = pu.productId

            JOIN ProductSuppliers ps
                ON ps.productId = pu.productId
                AND ps.status = 'active'

            JOIN Suppliers s
                ON s.id = ps.supplierId

            JOIN SupplierProductPrices spp
                ON spp.id = (
                    SELECT TOP 1 id
                    FROM SupplierProductPrices
                    WHERE productId = pu.productId
                      AND supplierId = s.id
                      AND unitId = pu.id
                    ORDER BY createdAt DESC
                )

            WHERE pu.id = @productUnitId

            ORDER BY spp.price ASC
        `);

    return result.recordset;
};

module.exports = {
    createPurchaseOrder,
    createPurchaseOrderItem,
    getSupplierPrice,
    updatePurchaseOrderTotal,
    getPurchaseOrderItems,
    updateStatus,
    receiveOrder,
    getPurchaseOrderById,
    getPurchaseOrders,
    countPurchaseOrders,
    getSuppliersByProductUnit
};
