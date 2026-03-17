const { connectDB, sql } = require('../../config/database');

async function insertSalePriceHistory(transaction, {
    productId,
    productUnitId,
    oldSalePrice = null,
    newSalePrice,
    changedBy = null
}) {
    await new sql.Request(transaction)
        .input('productId', sql.BigInt, productId)
        .input('productUnitId', sql.Int, productUnitId)
        .input('oldSalePrice', sql.Decimal(15, 2), oldSalePrice)
        .input('newSalePrice', sql.Decimal(15, 2), newSalePrice)
        .input('changedBy', sql.BigInt, changedBy)
        .query(`
            INSERT INTO ProductSalePriceHistories
            (productId, productUnitId, oldSalePrice, newSalePrice, changedBy, changedAt)
            VALUES
            (@productId, @productUnitId, @oldSalePrice, @newSalePrice, @changedBy, GETDATE())
        `);
}

exports.getList = async ({ search = '' }) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('search', sql.NVarChar, `%${search}%`)
        .query(`
            SELECT
                pu.id,
                pu.productId,
                pu.unitName,
                pu.unitType,
                pu.salePrice,
                pu.barcode,
                pu.conversionFactor,
                p.name AS productName
            FROM ProductUnits pu
            JOIN Products p ON p.id = pu.productId
            WHERE p.name LIKE @search
               OR p.code LIKE @search
               OR pu.barcode LIKE @search
               OR pu.unitName LIKE @search
            ORDER BY p.name, pu.conversionFactor
        `);
    return result.recordset;
};

exports.getById = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT
                pu.id,
                pu.productId,
                pu.unitName,
                pu.unitType,
                pu.salePrice,
                pu.barcode,
                pu.conversionFactor,
                p.name AS productName
            FROM ProductUnits pu
            JOIN Products p ON p.id = pu.productId
            WHERE pu.id = @id
        `);
    return result.recordset[0] || null;
};

exports.getByBarcode = async (barcode) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('barcode', sql.VarChar, barcode)
        .query(`
            SELECT
                pu.id,
                pu.id AS productUnitId,
                pu.productId,
                pu.unitType,
                pu.unitName,
                pu.salePrice,
                pu.barcode,
                pu.conversionFactor,
                p.name,
                p.allowDecimalQuantity,
                p.isCombo
            FROM ProductUnits pu
            JOIN Products p ON p.id = pu.productId
            WHERE pu.barcode = @barcode
        `);
    return result.recordset[0] || null;
};

exports.getByProduct = async (productId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query(`
            SELECT
                id,
                productId,
                unitName,
                unitType,
                salePrice,
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
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const insertResult = await new sql.Request(transaction)
            .input('productId', sql.BigInt, data.productId)
            .input('unitName', sql.NVarChar, data.unitName)
            .input('unitType', sql.VarChar, data.unitType)
            .input('conversionFactor', sql.Decimal(10, 3), data.conversionFactor)
            .input('salePrice', sql.Decimal(15, 2), data.salePrice)
            .input('barcode', sql.VarChar, data.barcode?.trim() || null)
            .query(`
                INSERT INTO ProductUnits
                (productId, unitName, unitType, conversionFactor, salePrice, barcode)
                OUTPUT INSERTED.id
                VALUES
                (@productId, @unitName, @unitType, @conversionFactor, @salePrice, @barcode)
            `);

        const id = insertResult.recordset[0].id;

        await insertSalePriceHistory(transaction, {
            productId: data.productId,
            productUnitId: id,
            oldSalePrice: null,
            newSalePrice: data.salePrice,
            changedBy: data.createdBy || null
        });

        await transaction.commit();
        return id;
    } catch (err) {
        try { await transaction.rollback(); } catch (_) { }
        throw err;
    }
};

exports.update = async (id, data) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const current = await new sql.Request(transaction)
            .input('id', sql.Int, id)
            .query(`
                SELECT id, productId, salePrice, conversionFactor
                FROM ProductUnits
                WHERE id = @id
            `);

        const unit = current.recordset[0];
        if (!unit) {
            await transaction.rollback();
            return false;
        }

        await new sql.Request(transaction)
            .input('id', sql.Int, id)
            .input('unitName', sql.NVarChar, data.unitName)
            .input('unitType', sql.VarChar, data.unitType)
            .input('conversionFactor', sql.Decimal(10, 3), data.conversionFactor)
            .input('salePrice', sql.Decimal(15, 2), data.salePrice)
            .input('barcode', sql.VarChar, data.barcode?.trim() || null)
            .query(`
                UPDATE ProductUnits
                SET
                    unitName = @unitName,
                    unitType = @unitType,
                    conversionFactor = @conversionFactor,
                    salePrice = @salePrice,
                    barcode = @barcode
                WHERE id = @id
            `);

        if (Number(unit.salePrice) !== Number(data.salePrice)) {
            await insertSalePriceHistory(transaction, {
                productId: unit.productId,
                productUnitId: id,
                oldSalePrice: Number(unit.salePrice),
                newSalePrice: Number(data.salePrice),
                changedBy: data.updatedBy || null
            });
        }

        await transaction.commit();
        return true;
    } catch (err) {
        try { await transaction.rollback(); } catch (_) { }
        throw err;
    }
};

exports.remove = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            DELETE FROM ProductUnits
            WHERE id = @id
        `);

    return result.rowsAffected[0] > 0;
};