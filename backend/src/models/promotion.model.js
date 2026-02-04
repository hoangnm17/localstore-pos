const { connectDB, sql } = require("../config/database.js");

exports.getPromotions = async (filters) => {
    const pool = await connectDB();
    const {
        search = '',
        status = null,
        type = null,
        limit = 10,
        offset = 0
    } = filters;

    let query = `
        SELECT *
        FROM Promotions
        WHERE 1=1
    `;

    if (status) query += ` AND status = @status`;
    if (type) query += ` AND type = @type`;
    if (search) query += ` AND name LIKE @search`;

    query += ` ORDER BY createdAt DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request()
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset);

    if (status) request.input('status', sql.VarChar, status);
    if (type) request.input('type', sql.VarChar, type);
    if (search) request.input('search', sql.NVarChar, `%${search}%`);

    const result = await request.query(query);
    return result.recordset;
};

exports.getPromotionById = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`SELECT * FROM Promotions WHERE id = @id`);

    if (result.recordset.length === 0) return null;

    const promotion = result.recordset[0];

    // Get related products if any
    const productsResult = await pool.request()
        .input('promotionId', sql.BigInt, id)
        .query(`
            SELECT pp.*, p.name as productName, c.name as categoryName
            FROM PromotionProducts pp
            LEFT JOIN Products p ON pp.productId = p.id
            LEFT JOIN Categories c ON pp.categoryId = c.id
            WHERE pp.promotionId = @promotionId
        `);

    promotion.items = productsResult.recordset;
    return promotion;
};

exports.createPromotion = async (data) => {
    const pool = await connectDB();
    const { name, type, value, startDate, endDate, status = 'Active' } = data;

    const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('type', sql.VarChar, type)
        .input('value', sql.Decimal(15, 2), value)
        .input('startDate', sql.DateTime2, startDate)
        .input('endDate', sql.DateTime2, endDate)
        .input('status', sql.VarChar, status)
        .query(`
            INSERT INTO Promotions (name, type, value, startDate, endDate, status)
            OUTPUT INSERTED.*
            VALUES (@name, @type, @value, @startDate, @endDate, @status)
        `);

    return result.recordset[0];
};

exports.addPromotionItem = async (promotionId, item) => {
    const pool = await connectDB();
    const { productId, categoryId } = item;

    // Validate that at least one is provided but typically not both in same row depending on logic, SQL allows both nullable.

    await pool.request()
        .input('promotionId', sql.BigInt, promotionId)
        .input('productId', sql.BigInt, productId || null)
        .input('categoryId', sql.Int, categoryId || null)
        .query(`
            INSERT INTO PromotionProducts (promotionId, productId, categoryId)
            VALUES (@promotionId, @productId, @categoryId)
        `);
};
