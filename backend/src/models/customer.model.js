const { connectDB, sql } = require("../config/database.js");

exports.getCustomers = async (filters) => {
    const pool = await connectDB();
    const {
        search = '',
        status = null,
        limit = 10,
        offset = 0
    } = filters;

    let query = `
        SELECT
            id,
            phone,
            name,
            loyaltyPoints,
            totalSpending,
            status,
            createdAt,
            updatedAt
        FROM Customers
        WHERE 1=1
    `;

    if (status) {
        query += ` AND status = @status`;
    }

    if (search) {
        query += ` AND (name LIKE @search OR phone LIKE @search)`;
    }

    query += ` ORDER BY createdAt DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request()
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset);

    if (status) request.input('status', sql.VarChar, status);
    if (search) request.input('search', sql.NVarChar, `%${search}%`);

    const result = await request.query(query);
    return result.recordset;
};

exports.countCustomers = async (filters) => {
    const pool = await connectDB();
    const { search = '', status = null } = filters;

    let query = `SELECT COUNT(*) AS total FROM Customers WHERE 1=1`;

    if (status) {
        query += ` AND status = @status`;
    }

    if (search) {
        query += ` AND (name LIKE @search OR phone LIKE @search)`;
    }

    const request = pool.request();
    if (status) request.input('status', sql.VarChar, status);
    if (search) request.input('search', sql.NVarChar, `%${search}%`);

    const result = await request.query(query);
    return result.recordset[0].total;
};

exports.getCustomerById = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`SELECT * FROM Customers WHERE id = @id`);
    return result.recordset[0];
};

exports.createCustomer = async (data) => {
    const pool = await connectDB();
    const { name, phone, status = 'Active', loyaltyPoints = 0, totalSpending = 0 } = data;

    const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('phone', sql.VarChar, phone)
        .input('status', sql.VarChar, status)
        .input('loyaltyPoints', sql.Int, loyaltyPoints)
        .input('totalSpending', sql.Decimal(15, 2), totalSpending)
        .query(`
            INSERT INTO Customers (name, phone, status, loyaltyPoints, totalSpending)
            OUTPUT INSERTED.*
            VALUES (@name, @phone, @status, @loyaltyPoints, @totalSpending)
        `);

    return result.recordset[0];
};

exports.updateCustomer = async (id, data) => {
    const pool = await connectDB();
    const { name, phone, status, loyaltyPoints, totalSpending } = data;

    // Dynamic partial update — chỉ SET những field nào được truyền vào
    const setClauses = [];
    const request = pool.request().input('id', sql.BigInt, id);

    if (name !== undefined) {
        setClauses.push('name = @name');
        request.input('name', sql.NVarChar, name);
    }
    if (phone !== undefined) {
        setClauses.push('phone = @phone');
        request.input('phone', sql.VarChar, phone);
    }
    if (status !== undefined) {
        setClauses.push('status = @status');
        request.input('status', sql.VarChar, status);
    }
    if (loyaltyPoints !== undefined) {
        setClauses.push('loyaltyPoints = @loyaltyPoints');
        request.input('loyaltyPoints', sql.Int, loyaltyPoints);
    }
    if (totalSpending !== undefined) {
        setClauses.push('totalSpending = @totalSpending');
        request.input('totalSpending', sql.Decimal(15, 2), totalSpending);
    }

    if (setClauses.length === 0) return null;

    const result = await request.query(`
        UPDATE Customers
        SET ${setClauses.join(', ')}
        OUTPUT INSERTED.*
        WHERE id = @id
    `);

    return result.recordset[0];
};

// Soft delete — set status = 'Inactive' thay vì xóa cứng
// Tránh lỗi FK với Invoices, CustomerPointLogs, CustomerVoucherUsage
exports.deleteCustomer = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
            UPDATE Customers
            SET status = 'Inactive'
            OUTPUT INSERTED.*
            WHERE id = @id
        `);
    return result.recordset[0];
};

// Tra cứu theo số điện thoại — dùng khi bán hàng cần tìm nhanh khách hàng tại quầy
exports.getCustomerByPhone = async (phone) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('phone', sql.VarChar, phone)
        .query(`SELECT * FROM Customers WHERE phone = @phone`);
    return result.recordset[0] || null;
};
