const { connectDB, sql } = require('../config/database');

// ROOT CATEGORY
exports.getRootCategories = async (search, limit, offset) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('search', sql.NVarChar, `%${search}%`)
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset)
        .query(`
            SELECT
                c.id, c.name, ISNULL(c.imageUrl,'') imageUrl, c.parentId,
                COUNT(DISTINCT p.id) productCount
            FROM Categories c
            LEFT JOIN Products p ON p.categoryId = c.id AND p.status = 'Selling'
            WHERE c.status = 1 AND c.parentId IS NULL AND c.name LIKE @search
            GROUP BY c.id, c.name, c.imageUrl, c.parentId
            ORDER BY c.name
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
    return result.recordset;
};

exports.countRootCategories = async (search) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('search', sql.NVarChar, `%${search}%`)
        .query(`
            SELECT COUNT(*) total
            FROM Categories
            WHERE status = 1 AND parentId IS NULL AND name LIKE @search
        `);
    return rs.recordset[0].total;
};

// Tất cả descendants của 1 list root category
exports.getAllDescendants = async (rootIds) => {
    if (!rootIds.length) return [];

    const pool = await connectDB();
    const req = pool.request();
    const params = rootIds.map((id, i) => {
        req.input(`id${i}`, sql.Int, id);
        return `@id${i}`;
    });

    const rs = await req.query(`
        WITH cte AS (
            SELECT id, name, imageUrl, parentId
            FROM Categories
            WHERE parentId IN (${params.join(',')}) AND status = 1
            UNION ALL
            SELECT c.id, c.name, c.imageUrl, c.parentId
            FROM Categories c JOIN cte ON c.parentId = cte.id
            WHERE c.status = 1
        )
        SELECT c.*, COUNT(DISTINCT p.id) productCount
        FROM cte c
        LEFT JOIN Products p ON p.categoryId = c.id AND p.status = 'Selling'
        GROUP BY c.id, c.name, c.imageUrl, c.parentId
    `);

    return rs.recordset;
};

// Create
exports.createCategory = async (name, parentId, imageUrl) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('parentId', sql.Int, parentId || null)
        .input('imageUrl', sql.NVarChar, imageUrl || null)
        .query(`
            INSERT INTO Categories(name, parentId, imageUrl, status)
            VALUES (@name, @parentId, @imageUrl, 1);
            SELECT SCOPE_IDENTITY() id;
        `);
    return rs.recordset[0].id;
};

// Update
exports.updateCategory = async (id, name, parentId, imageUrl) => {
    const pool = await connectDB();
    await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('parentId', sql.Int, parentId || null)
        .input('imageUrl', sql.NVarChar, imageUrl || null)
        .query(`
            UPDATE Categories
            SET name=@name, parentId=@parentId, imageUrl=@imageUrl
            WHERE id=@id
        `);
};

// Delete (soft delete)
exports.deleteCategory = async (id) => {
    if (!await exports.exists(id)) {
        throw new Error('CATEGORY_NOT_FOUND');
    }

    const hasProduct = await exports.hasProductInTree(id);
    if (hasProduct) {
        throw new Error('CATEGORY_HAS_PRODUCT');
    }

    const pool = await connectDB();
    await pool.request()
        .input('id', sql.Int, id)
        .query(`UPDATE Categories SET status = 0 WHERE id = @id`);
};

//check tồn tại
exports.exists = async (id) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT COUNT(*) total FROM Categories WHERE id=@id AND status=1`);
    return rs.recordset[0].total > 0;
};

//check còn sản phẩm trong cây category
exports.hasProductInTree = async (id) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            WITH cte AS (
                SELECT id FROM Categories WHERE id=@id AND status=1
                UNION ALL
                SELECT c.id FROM Categories c JOIN cte ON c.parentId = cte.id
                WHERE c.status=1
            )
            SELECT COUNT(*) total
            FROM Products
            WHERE status='Selling' AND categoryId IN (SELECT id FROM cte)
        `);
    return rs.recordset[0].total > 0;
};

//check circular parent
exports.isCircularParent = async (id, parentId) => {
    if (!parentId) return false;
    const pool = await connectDB();
    const rs = await pool.request()
        .input('id', sql.Int, id)
        .input('parentId', sql.Int, parentId)
        .query(`
            WITH cte AS (
                SELECT id, parentId FROM Categories WHERE id=@parentId
                UNION ALL
                SELECT c.id, c.parentId FROM Categories c JOIN cte ON c.id=cte.parentId
            )
            SELECT COUNT(*) total FROM cte WHERE id=@id
        `);
    return rs.recordset[0].total > 0;
};