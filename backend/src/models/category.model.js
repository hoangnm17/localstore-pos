const { connectDB, sql } = require('../config/database');

exports.getCategoriesList = async (search, limit, offset) => {
    const pool = await connectDB();

    const query = `
        SELECT
            c.id,
            c.name,
            ISNULL(c.imageUrl, '') AS imageUrl,
            c.parentId,
            COUNT(DISTINCT p.id) AS productCount
        FROM Categories c
        LEFT JOIN Products p 
            ON p.categoryId = c.id
            AND p.status = 'Selling'
        WHERE c.status = 1
          AND c.parentId IS NULL
          AND c.name LIKE @search
        GROUP BY c.id, c.name, c.imageUrl, c.parentId
        ORDER BY c.name
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const result = await pool.request()
        .input('search', sql.NVarChar, `%${search}%`)
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset)
        .query(query);

    return result.recordset;
};

exports.countCategories = async (search) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input('search', sql.NVarChar, `%${search}%`)
        .query(`
            SELECT COUNT(*) AS total
            FROM Categories
            WHERE status = 1
              AND parentId IS NULL
              AND name LIKE @search
        `);

    return result.recordset[0].total;
};

/**
 * Lấy ALL children theo danh sách rootIds
 */
exports.getChildrenCategoryList = async (rootIds) => {
    if (!rootIds.length) return [];

    const pool = await connectDB();
    const request = pool.request();

    const params = rootIds.map((id, i) => {
        request.input(`id${i}`, sql.Int, id);
        return `@id${i}`;
    });

    const query = `
        SELECT
            c.id,
            c.name,
            ISNULL(c.imageUrl, '') AS imageUrl,
            c.parentId,
            COUNT(DISTINCT p.id) AS productCount
        FROM Categories c
        LEFT JOIN Products p 
            ON p.categoryId = c.id
            AND p.status = 'Selling'
        WHERE c.status = 1
          AND c.parentId IN (${params.join(',')})
        GROUP BY c.id, c.name, c.imageUrl, c.parentId
        ORDER BY c.parentId, c.name
    `;

    const result = await request.query(query);
    return result.recordset;
};
