const { connectDB, sql } = require("../../config/database.js");

exports.insert = async (data) => {
    return db.query(
        `INSERT INTO PriceHistory
         (productId, salePrice, costPrice, createdBy)
         VALUES (?, ?, ?, ?)`,
        [data.productId, data.salePrice, data.costPrice, data.createdBy]
    );
};

exports.getLatestByProductId = async (productId) => {
    const rows = await db.query(
        `SELECT TOP 1 *
         FROM PriceHistory
         WHERE productId = ?
         ORDER BY createdAt DESC`,
        [productId]
    );
    return rows[0];
};