const { sql, connectDB } = require("../config/database.js");

// exports.getMonthlyReport = async ({
//     month,
//     year,
//     supplierId
// }) => {

//     const pool = await connectDB();

//     let whereClause = `
//         WHERE po.status = 'Received'
//         AND MONTH(po.createdAt) = @month
//         AND YEAR(po.createdAt) = @year
//     `;

//     const summaryRequest = pool.request()
//         .input("month", sql.Int, month)
//         .input("year", sql.Int, year);

//     if (supplierId) {
//         whereClause += " AND po.supplierId = @supplierId";
//         summaryRequest.input("supplierId", sql.Int, supplierId);
//     }

//     /* ================= SUMMARY ================= */
//     const summaryResult = await summaryRequest.query(`
//         SELECT 
//             COUNT(DISTINCT po.id) AS totalPO,
//             ISNULL(SUM(poi.quantityOrdered),0) AS totalQuantity,
//             COUNT(DISTINCT po.supplierId) AS totalSuppliers,
//             COUNT(DISTINCT poi.productId) AS totalProducts,
//             ISNULL(SUM(poi.lineTotal),0) AS totalAmount,
//             ISNULL(AVG(po.totalAmount),0) AS avgPOValue
//         FROM PurchaseOrders po
//         JOIN PurchaseOrderItems poi ON po.id = poi.poId
//         ${whereClause}
//     `);

//     /* ================= SUPPLIER STATS ================= */
//     const supplierResult = await pool.request()
//         .input("month", sql.Int, month)
//         .input("year", sql.Int, year)
//         .input("supplierId", sql.Int, supplierId || null)
//         .query(`
//             SELECT 
//                 s.id,
//                 s.name,
//                 COUNT(DISTINCT po.id) AS totalPO,
//                 SUM(poi.quantityOrdered) AS totalQuantity,
//                 SUM(poi.lineTotal) AS totalAmount
//             FROM PurchaseOrders po
//             JOIN Suppliers s ON po.supplierId = s.id
//             JOIN PurchaseOrderItems poi ON po.id = poi.poId
//             WHERE po.status = 'Received'
//             AND MONTH(po.createdAt) = @month
//             AND YEAR(po.createdAt) = @year
//             ${supplierId ? "AND po.supplierId = @supplierId" : ""}
//             GROUP BY s.id, s.name
//             ORDER BY totalAmount DESC
//         `);

//     /* ================= DAILY STATS ================= */
//     const dailyResult = await pool.request()
//         .input("month", sql.Int, month)
//         .input("year", sql.Int, year)
//         .input("supplierId", sql.Int, supplierId || null)
//         .query(`
//             SELECT 
//                 DAY(po.createdAt) AS day,
//                 SUM(poi.quantityOrdered) AS totalQuantity,
//                 SUM(poi.lineTotal) AS totalAmount
//             FROM PurchaseOrders po
//             JOIN PurchaseOrderItems poi ON po.id = poi.poId
//             WHERE po.status = 'Received'
//             AND MONTH(po.createdAt) = @month
//             AND YEAR(po.createdAt) = @year
//             ${supplierId ? "AND po.supplierId = @supplierId" : ""}
//             GROUP BY DAY(po.createdAt)
//             ORDER BY day
//         `);

//     /* ================= TOP PRODUCTS ================= */
//     const topProductsResult = await pool.request()
//         .input("month", sql.Int, month)
//         .input("year", sql.Int, year)
//         .input("supplierId", sql.Int, supplierId || null)
//         .query(`
//             SELECT TOP 5
//                 p.id,
//                 p.name,
//                 SUM(poi.quantityOrdered) AS totalQuantity,
//                 SUM(poi.lineTotal) AS totalAmount
//             FROM PurchaseOrders po
//             JOIN PurchaseOrderItems poi ON po.id = poi.poId
//             JOIN Products p ON poi.productId = p.id
//             WHERE po.status = 'Received'
//             AND MONTH(po.createdAt) = @month
//             AND YEAR(po.createdAt) = @year
//             ${supplierId ? "AND po.supplierId = @supplierId" : ""}
//             GROUP BY p.id, p.name
//             ORDER BY totalAmount DESC
//         `);

//     return {
//         filter: { month, year, supplierId },
//         summary: summaryResult.recordset[0] || {},
//         supplierStats: supplierResult.recordset || [],
//         dailyStats: dailyResult.recordset || [],
//         topProducts: topProductsResult.recordset || []
//     };
// };

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
                processBy = @userId
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
            // 1️⃣ Lấy productId + conversionFactor
            const unitResult = await new sql.Request(transaction)
                .input("productUnitId", sql.Int, item.productUnitId)
                .query(`
                    SELECT productId, conversionFactor
                    FROM ProductUnits
                    WHERE id = @productUnitId
                `);
            if (unitResult.recordset.length === 0) {
                throw new Error("UNIT_NOT_FOUND");
            }
            const unit = unitResult.recordset[0];
            const baseQuantity = item.receivedQuantity * unit.conversionFactor;

            // 2️⃣ Update receivedQuantity (KHÔNG update total vì là computed column)
            await new sql.Request(transaction)
                .input("receivedQuantity", sql.Decimal(15, 3), item.receivedQuantity)
                .input("poId", sql.Int, poId)
                .input("productUnitId", sql.Int, item.productUnitId)
                .query(`
                    UPDATE PurchaseOrderItems
                    SET receivedQuantity = receivedQuantity + @receivedQuantity
                    WHERE poId = @poId
                    AND productUnitId = @productUnitId
                `);

            // 3️⃣ Update tồn kho
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
        // 4️⃣ Tính lại totalAmount của PO theo số lượng đã nhận
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

        // 5️⃣ Update status PO
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
    countPurchaseOrders
};
