const { connectDB, sql } = require('../../config/database.js');

// Lấy danh sách combo items của 1 sản phẩm combo
exports.getComboItems = async (productId) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query(`
            SELECT pc.id, pc.parentProductId, pc.childProductId, pc.quantity,
                   p.name AS childProductName, p.code AS childProductCode, p.baseUnit
            FROM ProductCombos pc
            JOIN Products p ON pc.childProductId = p.id
            WHERE pc.parentProductId = @productId
            ORDER BY pc.id
        `);
    return rs.recordset;
};

// Thêm sản phẩm vào combo
exports.addComboItem = async (productId, { childProductId, quantity = 1 }) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('parentProductId', sql.BigInt, productId)
        .input('childProductId', sql.BigInt, childProductId)
        .input('quantity', sql.Int, quantity)
        .query(`
            INSERT INTO ProductCombos (parentProductId, childProductId, quantity)
            OUTPUT INSERTED.id
            VALUES (@parentProductId, @childProductId, @quantity)
        `);
    return rs.recordset[0];
};

// Xóa 1 item khỏi combo
exports.removeComboItem = async (comboItemId, productId) => {
    const pool = await connectDB();
    await pool.request()
        .input('id', sql.Int, comboItemId)
        .input('parentProductId', sql.BigInt, productId)
        .query(`DELETE FROM ProductCombos WHERE id = @id AND parentProductId = @parentProductId`);
};
