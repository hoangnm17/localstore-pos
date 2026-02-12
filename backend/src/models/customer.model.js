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
    
    // Dynamic update query builder could be better, but keeping it simple
    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .input('name', sql.NVarChar, name)
        .input('phone', sql.VarChar, phone)
        .input('status', sql.VarChar, status)
        .input('loyaltyPoints', sql.Int, loyaltyPoints)
        .input('totalSpending', sql.Decimal(15, 2), totalSpending)
        .query(`
            UPDATE Customers 
            SET name = @name, 
                phone = @phone, 
                status = @status, 
                loyaltyPoints = @loyaltyPoints, 
                totalSpending = @totalSpending
            OUTPUT INSERTED.*
            WHERE id = @id
        `);
        
    return result.recordset[0];
};

exports.deleteCustomer = async (id) => {
     // Usually soft delete or check dependencies, but here simple delete for now based on typical requirements unless specified
    const pool = await connectDB();
    await pool.request()
        .input('id', sql.BigInt, id)
        .query(`DELETE FROM Customers WHERE id = @id`);
    return true;
};
