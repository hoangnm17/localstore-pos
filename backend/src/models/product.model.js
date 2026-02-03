const { connectDB, sql } = require("../config/database.js");
exports.getProducts = async (filters) => {
    const pool = await connectDB();

    const {
        search = '',
        categoryId = null,
        status = 'Selling',
        limit = 10,
        offset = 0
    } = filters;

    const query = `
        SELECT
            p.id,
            p.code,
            p.barcode,
            p.name,
            p.imageUrl,
            p.baseUnit,
            p.salePrice,
            p.costPrice,
            p.status,
            c.name AS categoryName,
            ISNULL(s.quantityOnHand, 0) AS stockQuantity
        FROM Products p
        LEFT JOIN Categories c ON c.id = p.categoryId
        LEFT JOIN InventoryStocks s ON s.productId = p.id
        WHERE p.status = @status
          AND (
              p.name LIKE @search
              OR p.code LIKE @search
              OR p.barcode LIKE @search
          )
          AND (@categoryId IS NULL OR p.categoryId = @categoryId)
        ORDER BY p.createdAt DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const result = await pool.request()
        .input('search', sql.NVarChar, `%${search}%`)
        .input('status', sql.VarChar, status)
        .input('categoryId', sql.Int, categoryId)
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset)
        .query(query);

    return result.recordset;
};

exports.countProducts = async (filters) => {
    const { search = '', categoryId = null, status = 'Selling' } = filters;
    const pool = await connectDB();

    const result = await pool.request()
        .input('search', sql.NVarChar, `%${search}%`)
        .input('status', sql.VarChar, status)
        .input('categoryId', sql.Int, categoryId)
        .query(`
            SELECT COUNT(*) AS total
            FROM Products
            WHERE status = @status
              AND (
                name LIKE @search
                OR code LIKE @search
                OR barcode LIKE @search
              )
              AND (@categoryId IS NULL OR categoryId = @categoryId)
        `);

    return result.recordset[0].total;
};

exports.getProductDetail = async (id) => {
    const pool = await connectDB();

    const productResult = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
            SELECT
                id,
                code,
                barcode,
                name,
                imageUrl,
                baseUnit,
                salePrice,
                costPrice,
                status,
                categoryId
            FROM Products
            WHERE id = @id
        `);

    if (productResult.recordset.length === 0) return null;

    const unitsResult = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
            SELECT
                id,
                unitName,
                unitType,
                conversionFactor,
                price,
                barcode
            FROM ProductUnits
            WHERE productId = @id
            ORDER BY conversionFactor
        `);

    return {
        ...productResult.recordset[0],
        hasMultiUnit: unitsResult.recordset.length > 0,
        units: unitsResult.recordset
    };
};


exports.getProductByBarcode = async (barcode) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input('barcode', sql.VarChar, barcode)
        .query(`
            SELECT
                p.id AS productId,
                p.name,
                p.baseUnit,
                pu.id AS productUnitId,
                pu.unitName,
                pu.unitType,
                pu.conversionFactor,
                pu.price,
                pu.allowDecimal
            FROM ProductUnits pu
            JOIN Products p ON p.id = pu.productId
            WHERE pu.barcode = @barcode
        `);

    return result.recordset[0] || null;
};

