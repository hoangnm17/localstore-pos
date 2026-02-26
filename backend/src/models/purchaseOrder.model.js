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

        // 1️⃣ Insert PurchaseOrder
        const poResult = await new sql.Request(transaction)
            .input("supplierId", sql.Int, supplierId)
            .input("createdBy", sql.BigInt, createdBy)
            .input("note", sql.NVarChar(sql.MAX), note) 
            .query(`
                INSERT INTO PurchaseOrders 
                (supplierId, status, createdBy, note, createdAt)
                OUTPUT INSERTED.*
                VALUES (@supplierId, 'Pending', @createdBy, @note, GETDATE())
            `);

        const purchaseOrder = poResult.recordset[0];

        let totalAmount = 0;

        // 2️⃣ Insert từng item
        for (const item of items) {

            // Lấy thông tin sản phẩm + tồn kho
            const productResult = await new sql.Request(transaction)
                .input("productId", sql.BigInt, item.productId)
                .query(`
                    SELECT 
                        p.baseUnit,
                        p.costPrice,
                        s.quantityOnHand
                    FROM Products p
                    JOIN InventoryStocks s ON s.productId = p.id
                    WHERE p.id = @productId
                `);

            if (productResult.recordset.length === 0) {
                throw new Error("PRODUCT_NOT_FOUND");
            }

            const product = productResult.recordset[0];

            const quantityBefore = product.quantityOnHand;
            const baseUnit = product.baseUnit;
            const costPrice = product.costPrice;

            // Insert PurchaseOrderItem
            await new sql.Request(transaction)
                .input("poId", sql.Int, purchaseOrder.id)
                .input("productId", sql.BigInt, item.productId)
                .input("quantityBeforeOrdered", sql.Decimal(15,3), quantityBefore)
                .input("quantityOrdered", sql.Decimal(15,3), item.quantityOrdered)
                .input("baseUnit", sql.NVarChar(20), baseUnit)
                .input("costPrice", sql.Decimal(15,2), costPrice)
                .query(`
                    INSERT INTO PurchaseOrderItems
                    (poId, productId, quantityBeforeOrdered, quantityOrdered, baseUnit, costPrice)
                    VALUES (@poId, @productId, @quantityBeforeOrdered, @quantityOrdered, @baseUnit, @costPrice)
                `);

            totalAmount += item.quantityOrdered * costPrice;
        }

        // 3️⃣ Update totalAmount
        await new sql.Request(transaction)
            .input("poId", sql.Int, purchaseOrder.id)
            .input("totalAmount", sql.Decimal(18,2), totalAmount)
            .query(`
                UPDATE PurchaseOrders
                SET totalAmount = @totalAmount
                WHERE id = @poId
            `);

        await transaction.commit();

        purchaseOrder.totalAmount = totalAmount;

        return purchaseOrder;

    } catch (err) {
        try {
            await transaction.rollback();
        } catch {}
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

/* ==============================
   GET DETAIL BY ID
============================== */
exports.getDetailById = async (poId) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("poId", sql.Int, poId)
        .query(`
            SELECT 
                po.id,
                po.status,
                po.totalAmount,
                po.createdAt,
                po.note,

                po.createdBy,
                po.processBy,
                po.receivedBy,

                s.id AS supplierId,
                s.name AS supplierName,

                creator.fullName AS createdByName,
                processor.fullName AS processedByName,
                receiver.fullName AS receivedByName

            FROM PurchaseOrders po
            LEFT JOIN Suppliers s ON po.supplierId = s.id
            LEFT JOIN Staff creator ON po.createdBy = creator.id
            LEFT JOIN Staff processor ON po.processBy = processor.id
            LEFT JOIN Staff receiver ON po.receivedBy = receiver.id
            WHERE po.id = @poId
        `);

    if (result.recordset.length === 0) return null;

    const row = result.recordset[0];

    const itemsResult = await pool.request()
        .input("poId", sql.Int, poId)
        .query(`
            SELECT 
                poi.id,
                poi.productId,
                p.code,
                p.name AS productName,
                poi.baseUnit,
                poi.costPrice,
                poi.quantityBeforeOrdered,
                poi.quantityOrdered,
                poi.lineTotal,
                inv.quantityOnHand AS currentStock
            FROM PurchaseOrderItems poi
            LEFT JOIN Products p ON poi.productId = p.id
            LEFT JOIN InventoryStocks inv ON p.id = inv.productId
            WHERE poi.poId = @poId
        `);

    const items = itemsResult.recordset || [];

    const totalQuantity = items.reduce((sum, i) => sum + Number(i.quantityOrdered), 0);

    return {
        id: row.id,
        status: row.status,
        createdAt: row.createdAt,
        totalAmount: row.totalAmount,
        note: row.note,
        totalQuantity,

        supplier: {
            id: row.supplierId,
            name: row.supplierName
        },

        workflow: {
            createdBy: {
                id: row.createdBy,
                name: row.createdByName
            },
            processedBy: row.processBy ? {
                id: row.processBy,
                name: row.processedByName
            } : null,
            receivedBy: row.receivedBy ? {
                id: row.receivedBy,
                name: row.receivedByName
            } : null
        },

        items
    };
};
/* ==============================
   GET LIST WITH PAGINATION + FILTER
============================== */
exports.getList = async ({
    page = 1,
    pageSize = 15,
    from,
    to,
    status
}) => {

    const pool = await connectDB();
    const offset = (page - 1) * pageSize;

    let whereClause = "WHERE 1=1";
    const request = pool.request();

    if (from) {
        whereClause += " AND po.createdAt >= @from";
        request.input("from", sql.DateTime, new Date(from));
    }

    if (to) {
        whereClause += " AND po.createdAt <= @to";
        request.input("to", sql.DateTime, new Date(to));
    }

    if (status) {
        whereClause += " AND po.status = @status";
        request.input("status", sql.VarChar(20), status);
    }

    // 1️⃣ Lấy tổng số bản ghi
    const countResult = await request.query(`
        SELECT COUNT(*) as total
        FROM PurchaseOrders po
        ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // 2️⃣ Lấy danh sách phân trang
    const listRequest = pool.request();

    if (from) listRequest.input("from", sql.DateTime, new Date(from));
    if (to) listRequest.input("to", sql.DateTime, new Date(to));
    if (status) listRequest.input("status", sql.VarChar(20), status);

    listRequest
        .input("offset", sql.Int, offset)
        .input("pageSize", sql.Int, pageSize);

    const listResult = await listRequest.query(`
        SELECT 
            po.id,
            po.status,
            po.createdAt,
            s.name AS supplierName,
            creator.fullName AS createdByName
        FROM PurchaseOrders po
        LEFT JOIN Suppliers s ON po.supplierId = s.id
        LEFT JOIN Staff creator ON po.createdBy = creator.id
        ${whereClause}
        ORDER BY po.createdAt DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        data: listResult.recordset
    };
};

/* ==============================
   MONTHLY REPORT (RECEIVED)
============================== */
exports.getMonthlyReport = async ({
    month,
    year,
    supplierId
}) => {

    const pool = await connectDB();

    let whereClause = `
        WHERE po.status = 'Received'
        AND MONTH(po.createdAt) = @month
        AND YEAR(po.createdAt) = @year
    `;

    const summaryRequest = pool.request()
        .input("month", sql.Int, month)
        .input("year", sql.Int, year);

    if (supplierId) {
        whereClause += " AND po.supplierId = @supplierId";
        summaryRequest.input("supplierId", sql.Int, supplierId);
    }

    /* ================= SUMMARY ================= */
    const summaryResult = await summaryRequest.query(`
        SELECT 
            COUNT(DISTINCT po.id) AS totalPO,
            ISNULL(SUM(poi.quantityOrdered),0) AS totalQuantity,
            COUNT(DISTINCT po.supplierId) AS totalSuppliers,
            COUNT(DISTINCT poi.productId) AS totalProducts,
            ISNULL(SUM(poi.lineTotal),0) AS totalAmount,
            ISNULL(AVG(po.totalAmount),0) AS avgPOValue
        FROM PurchaseOrders po
        JOIN PurchaseOrderItems poi ON po.id = poi.poId
        ${whereClause}
    `);

    /* ================= SUPPLIER STATS ================= */
    const supplierResult = await pool.request()
        .input("month", sql.Int, month)
        .input("year", sql.Int, year)
        .input("supplierId", sql.Int, supplierId || null)
        .query(`
            SELECT 
                s.id,
                s.name,
                COUNT(DISTINCT po.id) AS totalPO,
                SUM(poi.quantityOrdered) AS totalQuantity,
                SUM(poi.lineTotal) AS totalAmount
            FROM PurchaseOrders po
            JOIN Suppliers s ON po.supplierId = s.id
            JOIN PurchaseOrderItems poi ON po.id = poi.poId
            WHERE po.status = 'Received'
            AND MONTH(po.createdAt) = @month
            AND YEAR(po.createdAt) = @year
            ${supplierId ? "AND po.supplierId = @supplierId" : ""}
            GROUP BY s.id, s.name
            ORDER BY totalAmount DESC
        `);

    /* ================= DAILY STATS ================= */
    const dailyResult = await pool.request()
        .input("month", sql.Int, month)
        .input("year", sql.Int, year)
        .input("supplierId", sql.Int, supplierId || null)
        .query(`
            SELECT 
                DAY(po.createdAt) AS day,
                SUM(poi.quantityOrdered) AS totalQuantity,
                SUM(poi.lineTotal) AS totalAmount
            FROM PurchaseOrders po
            JOIN PurchaseOrderItems poi ON po.id = poi.poId
            WHERE po.status = 'Received'
            AND MONTH(po.createdAt) = @month
            AND YEAR(po.createdAt) = @year
            ${supplierId ? "AND po.supplierId = @supplierId" : ""}
            GROUP BY DAY(po.createdAt)
            ORDER BY day
        `);

    /* ================= TOP PRODUCTS ================= */
    const topProductsResult = await pool.request()
        .input("month", sql.Int, month)
        .input("year", sql.Int, year)
        .input("supplierId", sql.Int, supplierId || null)
        .query(`
            SELECT TOP 5
                p.id,
                p.name,
                SUM(poi.quantityOrdered) AS totalQuantity,
                SUM(poi.lineTotal) AS totalAmount
            FROM PurchaseOrders po
            JOIN PurchaseOrderItems poi ON po.id = poi.poId
            JOIN Products p ON poi.productId = p.id
            WHERE po.status = 'Received'
            AND MONTH(po.createdAt) = @month
            AND YEAR(po.createdAt) = @year
            ${supplierId ? "AND po.supplierId = @supplierId" : ""}
            GROUP BY p.id, p.name
            ORDER BY totalAmount DESC
        `);

    return {
        filter: { month, year, supplierId },
        summary: summaryResult.recordset[0] || {},
        supplierStats: supplierResult.recordset || [],
        dailyStats: dailyResult.recordset || [],
        topProducts: topProductsResult.recordset || []
    };
};