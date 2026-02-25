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

    // 1. Thực hiện INSERT (Bỏ OUTPUT INSERTED.*)
    const insertResult = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('phone', sql.VarChar, phone)
        .input('status', sql.VarChar, status)
        .input('loyaltyPoints', sql.Int, loyaltyPoints)
        .input('totalSpending', sql.Decimal(15, 2), totalSpending)
        .query(`
            INSERT INTO Customers (name, phone, status, loyaltyPoints, totalSpending)
            VALUES (@name, @phone, @status, @loyaltyPoints, @totalSpending);
            SELECT SCOPE_IDENTITY() AS id; -- Lấy ID vừa tạo
        `);

    const newId = insertResult.recordset[0].id;

    // 2. Truy vấn lại dữ liệu hoàn chỉnh để trả về
    const finalResult = await pool.request()
        .input('id', sql.BigInt, newId)
        .query("SELECT * FROM Customers WHERE id = @id");

    return finalResult.recordset[0];
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

    // ... các dòng code trước vẫn giữ nguyên ...

    // 1. Thực hiện UPDATE (Bỏ OUTPUT INSERTED.*)
    await request.query(`
        UPDATE Customers
        SET ${setClauses.join(', ')}
        WHERE id = @id
    `);

    // 2. SELECT lại kết quả mới
    const finalResult = await pool.request()
        .input('id', sql.BigInt, id)
        .query("SELECT * FROM Customers WHERE id = @id");

    return finalResult.recordset[0];
};
// Soft delete — set status = 'Inactive' thay vì xóa cứng
// Tránh lỗi FK với Invoices, CustomerPointLogs, CustomerVoucherUsage
exports.deleteCustomer = async (id) => {
    const pool = await connectDB();

    // 1. Thực hiện UPDATE trạng thái
    await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
            UPDATE Customers
            SET status = 'Inactive'
            WHERE id = @id
        `);

    // 2. SELECT lại record để trả về cho Frontend
    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`SELECT * FROM Customers WHERE id = @id`);

    return result.recordset[0];
};

/**
 * Tìm chính xác theo số điện thoại — dùng khi bán hàng cần tra cứu nhanh tại quầy.
 * Trả về 1 record hoặc null.
 */
exports.getCustomerByPhone = async (phone) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('phone', sql.VarChar, phone)
        .query(`SELECT * FROM Customers WHERE phone = @phone`);
    return result.recordset[0] || null;
};

/**
 * Tìm kiếm khách theo số điện thoại (LIKE) — trả về danh sách tối đa 10 kết quả.
 * Dùng cho ô tìm kiếm trên UI.
 */
exports.searchCustomersByPhone = async (phone) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('phone', sql.VarChar, `%${phone}%`)
        .query(`
            SELECT TOP 10
                id, phone, name, loyaltyPoints, totalSpending, status
            FROM Customers
            WHERE phone LIKE @phone
            ORDER BY createdAt DESC
        `);
    return result.recordset;
};

/**
 * Lịch sử mua hàng của khách — UC3: View Purchase History
 * JOIN InvoiceItems để lấy số lượng dòng hàng mỗi hóa đơn.
 */
exports.getPurchaseHistory = async (customerId, { limit = 10, offset = 0 } = {}) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('customerId', sql.BigInt, customerId)
        .input('limit', sql.Int, parseInt(limit))
        .input('offset', sql.Int, parseInt(offset))
        .query(`
            SELECT
                i.id,
                i.invoiceCode,
                i.totalAmount,
                i.promotionDiscount,
                i.voucherDiscount,
                i.pointDiscount,
                i.usedPoints,
                i.finalAmount,
                i.status,
                i.createdAt,
                COUNT(ii.id) AS itemCount
            FROM Invoices i
            LEFT JOIN InvoiceItems ii ON i.id = ii.invoiceId
            WHERE i.customerId = @customerId
            GROUP BY
                i.id, i.invoiceCode, i.totalAmount, i.promotionDiscount,
                i.voucherDiscount, i.pointDiscount, i.usedPoints,
                i.finalAmount, i.status, i.createdAt
            ORDER BY i.createdAt DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
    return result.recordset;
};

exports.countPurchaseHistory = async (customerId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('customerId', sql.BigInt, customerId)
        .query(`SELECT COUNT(*) AS total FROM Invoices WHERE customerId = @customerId`);
    return result.recordset[0].total;
};