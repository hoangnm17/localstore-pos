const { sql, connectDB } = require("../config/database.js");

const getMonthlyReport = async ({ month, year, supplierId }) => {

    const pool = await connectDB();

    let supplierFilter = "";
    if (supplierId) supplierFilter = "AND po.supplierId = @supplierId";

    /* ================= SUMMARY ================= */

    const summaryResult = await pool.request()
        .input("month", sql.Int, month)
        .input("year", sql.Int, year)
        .input("supplierId", sql.Int, supplierId || null)
        .query(`
            SELECT 
                COUNT(DISTINCT po.id) AS totalPO,

                ISNULL(SUM(poi.quantity),0) AS totalQuantityOrdered,

                ISNULL(SUM(poi.receivedQuantity),0) AS totalQuantityReceived,

                COUNT(DISTINCT po.supplierId) AS totalSuppliers,

                COUNT(DISTINCT pu.productId) AS totalProducts,

                ISNULL(SUM(poi.receivedQuantity * poi.costPrice),0) AS totalAmount,

                ISNULL(AVG(po.totalAmount),0) AS avgPOValue

            FROM PurchaseOrders po
            JOIN PurchaseOrderItems poi ON po.id = poi.poId
            JOIN ProductUnits pu ON poi.productUnitId = pu.id

            WHERE 
                po.status IN ('Received','PartiallyReceived')
                AND MONTH(po.createdAt) = @month
                AND YEAR(po.createdAt) = @year
                ${supplierFilter}
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

                SUM(poi.receivedQuantity) AS totalQuantity,

                SUM(poi.receivedQuantity * poi.costPrice) AS totalAmount

            FROM PurchaseOrders po

            JOIN Suppliers s ON po.supplierId = s.id
            JOIN PurchaseOrderItems poi ON po.id = poi.poId

            WHERE 
                po.status IN ('Received','PartiallyReceived')
                AND MONTH(po.createdAt) = @month
                AND YEAR(po.createdAt) = @year
                ${supplierFilter}

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

                SUM(poi.receivedQuantity) AS totalQuantity,

                SUM(poi.receivedQuantity * poi.costPrice) AS totalAmount,

                COUNT(DISTINCT po.id) AS totalPO

            FROM PurchaseOrders po

            JOIN PurchaseOrderItems poi ON po.id = poi.poId

            WHERE 
                po.status IN ('Received','PartiallyReceived')
                AND MONTH(po.createdAt) = @month
                AND YEAR(po.createdAt) = @year
                ${supplierFilter}

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

                SUM(poi.receivedQuantity) AS totalQuantity,

                SUM(poi.receivedQuantity * poi.costPrice) AS totalAmount

            FROM PurchaseOrders po

            JOIN PurchaseOrderItems poi ON po.id = poi.poId
            JOIN ProductUnits pu ON poi.productUnitId = pu.id
            JOIN Products p ON pu.productId = p.id

            WHERE 
                po.status IN ('Received','PartiallyReceived')
                AND MONTH(po.createdAt) = @month
                AND YEAR(po.createdAt) = @year
                ${supplierFilter}

            GROUP BY p.id, p.name
            ORDER BY totalQuantity DESC
        `);

    return {
        filter: { month, year, supplierId },

        summary: summaryResult.recordset[0] || {},

        supplierStats: supplierResult.recordset || [],

        dailyStats: dailyResult.recordset || [],

        topProducts: topProductsResult.recordset || []
    };
};

module.exports = {
    getMonthlyReport
};