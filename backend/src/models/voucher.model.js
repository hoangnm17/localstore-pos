const { connectDB, sql } = require("../config/database.js");

exports.getVouchers = async (filters) => {
    const pool = await connectDB();
    const {
        search = '',
        status = null,
        limit = 10,
        offset = 0
    } = filters;

    let query = `SELECT * FROM Vouchers WHERE 1=1`;

    if (status) query += ` AND status = @status`;
    if (search) query += ` AND code LIKE @search`;

    query += ` ORDER BY createdAt DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request()
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset);

    if (status) request.input('status', sql.VarChar, status);
    if (search) request.input('search', sql.VarChar, `%${search}%`);

    const result = await request.query(query);
    return result.recordset;
};

exports.getVoucherByCode = async (code) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('code', sql.VarChar, code)
        .query(`SELECT * FROM Vouchers WHERE code = @code`);
    return result.recordset[0];
};

exports.createVoucher = async (data) => {
    const pool = await connectDB();
    const { code, value, type, minOrderValue, maxUsage, startDate, expiryDate, status = 'Active' } = data;

    const result = await pool.request()
        .input('code', sql.VarChar, code)
        .input('value', sql.Decimal(15, 2), value)
        .input('type', sql.VarChar, type)
        .input('minOrderValue', sql.Decimal(15, 2), minOrderValue)
        .input('maxUsage', sql.Int, maxUsage)
        .input('startDate', sql.DateTime2, startDate)
        .input('expiryDate', sql.DateTime2, expiryDate)
        .input('status', sql.VarChar, status)
        .query(`
            INSERT INTO Vouchers (code, value, type, minOrderValue, maxUsage, startDate, expiryDate, status)
            OUTPUT INSERTED.*
            VALUES (@code, @value, @type, @minOrderValue, @maxUsage, @startDate, @expiryDate, @status)
        `);
    return result.recordset[0];
};
