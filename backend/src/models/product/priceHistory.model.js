const { connectDB, sql } = require('../../config/database.js');

exports.insertSaleHistory = async (data) => {
    const pool = await connectDB();
    await pool.request()
        .input('productId', sql.BigInt, data.productId)
        .input('productUnitId', sql.Int, data.productUnitId)
        .input('oldSalePrice', sql.Decimal(15, 2), data.oldSalePrice)
        .input('newSalePrice', sql.Decimal(15, 2), data.newSalePrice)
        .input('changedBy', sql.BigInt, data.changedBy || null)
        .query(`
            INSERT INTO ProductSalePriceHistories
            (productId, productUnitId, oldSalePrice, newSalePrice, changedBy, changedAt)
            VALUES
            (@productId, @productUnitId, @oldSalePrice, @newSalePrice, @changedBy, GETDATE())
        `);
};

exports.getLatestSaleByProductId = async (productId) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query(`
            SELECT TOP 1
                ph.*,
                pu.unitName,
                s.fullName AS changedByName
            FROM ProductSalePriceHistories ph
            LEFT JOIN ProductUnits pu
                ON pu.id = ph.productUnitId
               AND pu.productId = ph.productId
            LEFT JOIN Staff s
                ON s.id = ph.changedBy
            WHERE ph.productId = @productId
            ORDER BY ph.changedAt DESC, ph.id DESC
        `);

    return rs.recordset[0] || null;
};

exports.getAllSaleByProductId = async (productId) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query(`
            SELECT
                ph.*,
                pu.unitName,
                s.fullName AS changedByName
            FROM ProductSalePriceHistories ph
            LEFT JOIN ProductUnits pu
                ON pu.id = ph.productUnitId
               AND pu.productId = ph.productId
            LEFT JOIN Staff s
                ON s.id = ph.changedBy
            WHERE ph.productId = @productId
            ORDER BY ph.changedAt DESC, ph.id DESC
        `);

    return rs.recordset;
};

exports.getLatestCostByProductId = async (productId) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query(`
            SELECT TOP 1
                poi.id,
                poi.productId,
                poi.costPrice,
                poi.quantityOrdered,
                poi.baseUnit,
                po.id AS purchaseOrderId,
                po.createdAt AS changedAt,
                sup.name AS supplierName,
                s.fullName AS changedByName
            FROM PurchaseOrderItems poi
            INNER JOIN PurchaseOrders po
                ON po.id = poi.poId
            LEFT JOIN Suppliers sup
                ON sup.id = po.supplierId
            LEFT JOIN Staff s
                ON s.id = po.createdBy
            WHERE poi.productId = @productId
              AND po.status = 'Received'
            ORDER BY po.createdAt DESC, poi.id DESC
        `);

    return rs.recordset[0] || null;
};

exports.getAllCostByProductId = async (productId) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query(`
            SELECT
                poi.id,
                poi.productId,
                poi.costPrice,
                poi.quantityOrdered,
                poi.baseUnit,
                po.id AS purchaseOrderId,
                po.createdAt AS changedAt,
                sup.name AS supplierName,
                s.fullName AS changedByName
            FROM PurchaseOrderItems poi
            INNER JOIN PurchaseOrders po
                ON po.id = poi.poId
            LEFT JOIN Suppliers sup
                ON sup.id = po.supplierId
            LEFT JOIN Staff s
                ON s.id = po.createdBy
            WHERE poi.productId = @productId
              AND po.status = 'Received'
            ORDER BY po.createdAt DESC, poi.id DESC
        `);

    return rs.recordset;
};