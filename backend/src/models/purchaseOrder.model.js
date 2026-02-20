const { sql, connectDB } = require("../config/database.js");

exports.createPurchaseOrder = async ({ supplierId, note, createdBy }) => {
    const pool = await connectDB();

    const query = `
        INSERT INTO PurchaseOrders (supplierId, note, status, createdBy, createdAt)
        OUTPUT INSERTED.*
        VALUES (@supplierId, @note, 'Pending', @createdBy, GETDATE())
    `;

    const result = await pool.request()
        .input("supplierId", sql.Int, supplierId)
        .input("note", sql.NVarChar, note)
        .input("createdBy", sql.Int, createdBy)
        .query(query);

    return result.recordset[0];
};