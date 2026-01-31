const { connectDB, sql } = require("../config/database");

exports.getProductsByCategory = async (
    categoryId,
    search,
    limit,
    offset
) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("categoryId", sql.BigInt, categoryId)
        .input("search", sql.NVarChar, `%${search}%`)
        .input("limit", sql.Int, limit)
        .input("offset", sql.Int, offset)
        .query(`
            SELECT
                c.name AS categoryName,
                p.id AS productId,
                p.name AS productName,
                p.code AS productCode,
                p.imageUrl,
                s.quantityOnHand,
                s.minThreshold,
                CASE
                    WHEN s.quantityOnHand <= s.minThreshold THEN 'LOW'
                    ELSE 'NORMAL'
                END AS stockStatus
            FROM Products p
            JOIN Categories c ON c.id = p.categoryId
            LEFT JOIN InventoryStocks s ON s.productId = p.id
            WHERE p.categoryId = @categoryId
              AND (p.name LIKE @search OR p.code LIKE @search)
            ORDER BY p.name
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

    return result.recordset;
};

exports.countProductsByCategory = async (categoryId, search) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("categoryId", sql.BigInt, categoryId)
        .input("search", sql.NVarChar, `%${search}%`)
        .query(`
            SELECT COUNT(*) AS total
            FROM Products
            WHERE categoryId = @categoryId
              AND (name LIKE @search OR code LIKE @search)
        `);

    return result.recordset[0].total;
};

exports.updateStock = async (productId, quantity) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("productId", sql.BigInt, productId)
        .input("quantity", sql.Int, quantity)
        .query(`
            UPDATE InventoryStocks
            SET quantityOnHand = @quantity
            WHERE productId = @productId
        `);

    return result.rowsAffected[0];
};
