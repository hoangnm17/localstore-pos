const { connectDB, sql } = require('../config/database');

exports.getList = async ({ search = '' }) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('search', sql.NVarChar, `%${search}%`)
        .query(`
            SELECT
                pu.id,
                pu.unitName,
                pu.unitType,
                pu.price,
                pu.barcode,
                pu.conversionFactor,
                p.name AS productName
            FROM ProductUnits pu
            JOIN Products p ON p.id = pu.productId
            WHERE p.name LIKE @search OR pu.barcode LIKE @search
            ORDER BY p.name
        `);
    return result.recordset;
};

exports.getByBarcode = async (barcode) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('barcode', sql.VarChar, barcode)
        .query(`
            SELECT
                pu.id AS productUnitId,
                pu.unitType,
                pu.unitName,
                pu.price,
                pu.conversionFactor,
                pu.allowDecimal,
                p.id AS productId,
                p.name
            FROM ProductUnits pu
            JOIN Products p ON p.id = pu.productId
            WHERE pu.barcode = @barcode
        `);
    return result.recordset[0];
};

exports.getByProduct = async (productId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query(`
            SELECT
                id,
                unitName,
                unitType,
                price,
                barcode,
                conversionFactor
            FROM ProductUnits
            WHERE productId = @productId
            ORDER BY conversionFactor
        `);
    return result.recordset;
};

exports.create = async (data) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('productId', sql.BigInt, data.productId)
        .input('unitName', sql.NVarChar, data.unitName)
        .input('unitType', sql.VarChar, data.unitType)
        .input('conversionFactor', sql.Decimal(10, 3), data.conversionFactor)
        .input('price', sql.Decimal(15, 2), data.price)
        .input('barcode', sql.VarChar, data.barcode)
        .query(`
            INSERT INTO ProductUnits
            (productId, unitName, unitType, conversionFactor, price, barcode)
            VALUES
            (@productId, @unitName, @unitType, @conversionFactor, @price, @barcode)
            SELECT SCOPE_IDENTITY() AS id
        `);
    return result.recordset[0].id;
};

exports.update = async (id, data) => {
    const pool = await connectDB();
    await pool.request()
        .input('id', sql.Int, id)
        .input('unitName', sql.NVarChar, data.unitName)
        .input('unitType', sql.VarChar, data.unitType)
        .input('conversionFactor', sql.Decimal(10, 3), data.conversionFactor)
        .input('price', sql.Decimal(15, 2), data.price)
        .input('barcode', sql.VarChar, data.barcode)
        .query(`
            UPDATE ProductUnits
            SET unitName = @unitName,
                unitType = @unitType,
                conversionFactor = @conversionFactor,
                price = @price,
                barcode = @barcode
            WHERE id = @id
        `);
};

exports.remove = async (id) => {
    const pool = await connectDB();
    await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM ProductUnits WHERE id = @id`);
};
