const { connectDB, sql } = require('../../config/database.js');

exports.insert = async (data) => {
    const pool = await connectDB();
    await pool.request()
        .input('productId', sql.BigInt, data.productId)
        .input('salePrice', sql.Decimal(18, 2), data.salePrice)
        .input('costPrice', sql.Decimal(18, 2), data.costPrice)
        .input('createdBy', sql.Int, data.createdBy || null)
        .query(`
            INSERT INTO PriceHistory (productId, salePrice, costPrice, createdBy, createdAt)
            VALUES (@productId, @salePrice, @costPrice, @createdBy, GETDATE())
        `);
};

exports.getLatestByProductId = async (productId) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query(`
            SELECT TOP 1 *
            FROM PriceHistory
            WHERE productId = @productId
            ORDER BY createdAt DESC
        `);
    return rs.recordset[0] || null;
};