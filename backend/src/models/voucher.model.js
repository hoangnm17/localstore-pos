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

exports.countVouchers = async (filters) => {
    const pool = await connectDB();
    const { search = '', status = null } = filters;

    let query = `SELECT COUNT(*) AS total FROM Vouchers WHERE 1=1`;
    if (status) query += ` AND status = @status`;
    if (search) query += ` AND code LIKE @search`;

    const request = pool.request();
    if (status) request.input('status', sql.VarChar, status);
    if (search) request.input('search', sql.VarChar, `%${search}%`);

    const result = await request.query(query);
    return result.recordset[0].total;
};

exports.getVoucherById = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT * FROM Vouchers WHERE id = @id`);
    return result.recordset[0] || null;
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
    const { code, value, type, minOrderValue = 0, maxUsage = 100, startDate, expiryDate, status = 'Active' } = data;

    const result = await pool.request()
        .input('code', sql.VarChar, code)
        .input('value', sql.Decimal(15, 2), value)
        .input('type', sql.VarChar, type)
        .input('minOrderValue', sql.Decimal(15, 2), minOrderValue)
        .input('maxUsage', sql.Int, maxUsage)
        .input('startDate', sql.DateTime2, startDate || null)
        .input('expiryDate', sql.DateTime2, expiryDate || null)
        .input('status', sql.VarChar, status)
        .query(`
            INSERT INTO Vouchers (code, value, type, minOrderValue, maxUsage, startDate, expiryDate, status)
            OUTPUT INSERTED.*
            VALUES (@code, @value, @type, @minOrderValue, @maxUsage, @startDate, @expiryDate, @status)
        `);
    return result.recordset[0];
};

exports.updateVoucher = async (id, data) => {
    const pool = await connectDB();
    const { value, type, minOrderValue, maxUsage, startDate, expiryDate, status } = data;

    const setClauses = [];
    const request = pool.request().input('id', sql.Int, id);

    if (value !== undefined) { setClauses.push('value = @value'); request.input('value', sql.Decimal(15, 2), value); }
    if (type !== undefined) { setClauses.push('type = @type'); request.input('type', sql.VarChar, type); }
    if (minOrderValue !== undefined) { setClauses.push('minOrderValue = @minOrderValue'); request.input('minOrderValue', sql.Decimal(15, 2), minOrderValue); }
    if (maxUsage !== undefined) { setClauses.push('maxUsage = @maxUsage'); request.input('maxUsage', sql.Int, maxUsage); }
    if (startDate !== undefined) { setClauses.push('startDate = @startDate'); request.input('startDate', sql.DateTime2, startDate || null); }
    if (expiryDate !== undefined) { setClauses.push('expiryDate = @expiryDate'); request.input('expiryDate', sql.DateTime2, expiryDate || null); }
    if (status !== undefined) { setClauses.push('status = @status'); request.input('status', sql.VarChar, status); }

    if (setClauses.length === 0) return null;

    const result = await request.query(`
        UPDATE Vouchers
        SET ${setClauses.join(', ')}
        OUTPUT INSERTED.*
        WHERE id = @id
    `);
    return result.recordset[0];
};

// Soft delete — đặt status = 'Disabled'
exports.deleteVoucher = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            UPDATE Vouchers
            SET status = 'Disabled'
            OUTPUT INSERTED.*
            WHERE id = @id
        `);
    return result.recordset[0];
};
