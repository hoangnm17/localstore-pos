const { connectDB, sql } = require("../config/database.js");

exports.getCategoryStock = async (search, limit, offset) => {
    const pool = await connectDB();

    const query = `
        SELECT 
            c.id AS categoryId,
            c.name AS categoryName,
            c.imageUrl,
            COUNT(DISTINCT p.id) AS totalProducts,
            COALESCE(SUM(s.quantityOnHand), 0) AS totalStock
        FROM Categories c
        LEFT JOIN Products p ON p.categoryId = c.id
        LEFT JOIN InventoryStocks s ON s.productId = p.id
        WHERE c.name LIKE @search
        GROUP BY c.id, c.name, c.imageUrl
        ORDER BY c.name
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const result = await pool.request()
        .input("search", sql.NVarChar, `%${search}%`)
        .input("limit", sql.Int, limit)
        .input("offset", sql.Int, offset)
        .query(query);

    return result.recordset;
};

exports.countCategories = async (search) => {
    const pool = await connectDB();

    const query = `
        SELECT COUNT(*) AS total
        FROM Categories
        WHERE name LIKE @search
    `;

    const result = await pool.request()
        .input("search", sql.NVarChar, `%${search}%`)
        .query(query);

    return result.recordset[0].total;
};
