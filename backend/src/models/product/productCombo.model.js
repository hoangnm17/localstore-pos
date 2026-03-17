const { connectDB, sql } = require('../../config/database.js');

exports.getComboItems = async (productId) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query(`
            SELECT
                pc.id,
                pc.parentProductId,
                pc.childProductId,
                pc.quantity,
                p.name AS childProductName,
                p.code AS childProductCode,
                p.baseUnit
            FROM ProductCombos pc
            JOIN Products p ON pc.childProductId = p.id
            WHERE pc.parentProductId = @productId
            ORDER BY pc.id
        `);
    return rs.recordset;
};

exports.addComboItem = async (productId, { childProductId, quantity = 1 }) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('parentProductId', sql.BigInt, productId)
        .input('childProductId', sql.BigInt, childProductId)
        .input('quantity', sql.Decimal(15, 3), quantity)
        .query(`
            INSERT INTO ProductCombos (parentProductId, childProductId, quantity)
            OUTPUT INSERTED.id, INSERTED.parentProductId, INSERTED.childProductId, INSERTED.quantity
            VALUES (@parentProductId, @childProductId, @quantity)
        `);
    return rs.recordset[0];
};

exports.removeComboItem = async (comboItemId, productId) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('id', sql.Int, comboItemId)
        .input('parentProductId', sql.BigInt, productId)
        .query(`
            DELETE FROM ProductCombos
            WHERE id = @id AND parentProductId = @parentProductId
        `);

    return rs.rowsAffected[0] > 0;
};