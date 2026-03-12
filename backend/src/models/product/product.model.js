const { connectDB, sql } = require("../../config/database.js");

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
        ${categoryId ? `
        WITH CategoryTree AS (
            SELECT id FROM Categories WHERE id = @categoryId
            UNION ALL
            SELECT c.id
            FROM Categories c
            JOIN CategoryTree ct ON c.parentId = ct.id
        )
        ` : ``}
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
            p.allowDecimalQuantity,
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
          ${categoryId ? `AND p.categoryId IN (SELECT id FROM CategoryTree)` : ``}
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
    const pool = await connectDB();
    const { search = '', categoryId = null, status = 'Selling' } = filters;

    const query = `
        ${categoryId ? `
        WITH CategoryTree AS (
            SELECT id FROM Categories WHERE id = @categoryId
            UNION ALL
            SELECT c.id
            FROM Categories c
            JOIN CategoryTree ct ON c.parentId = ct.id
        )
        ` : ``}
        SELECT COUNT(*) AS total
        FROM Products p
        WHERE p.status = @status
          AND (
              p.name LIKE @search
              OR p.code LIKE @search
              OR p.barcode LIKE @search
          )
          ${categoryId ? `AND p.categoryId IN (SELECT id FROM CategoryTree)` : ``}
    `;

    const result = await pool.request()
        .input('search', sql.NVarChar, `%${search}%`)
        .input('status', sql.VarChar, status)
        .input('categoryId', sql.Int, categoryId)
        .query(query);

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
                categoryId,
                allowDecimalQuantity
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
                p.allowDecimalQuantity
            FROM ProductUnits pu
            JOIN Products p ON p.id = pu.productId
            WHERE pu.barcode = @barcode
        `);

    return result.recordset[0] || null;
};

exports.createProduct = async (productData) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('code', sql.VarChar, productData.code)
        .input('barcode', sql.VarChar, productData.barcode)
        .input('name', sql.NVarChar, productData.name)
        .input('imageUrl', sql.NVarChar, productData.imageUrl || null)
        .input('baseUnit', sql.NVarChar, productData.baseUnit)
        .input('salePrice', sql.Decimal(18, 2), productData.salePrice)
        .input('costPrice', sql.Decimal(18, 2), productData.costPrice)
        .input('status', sql.VarChar, productData.status || 'Selling')
        .input('categoryId', sql.Int, productData.categoryId || null)
        .query(`
            INSERT INTO Products
            (code, barcode, name, imageUrl, baseUnit, salePrice, costPrice, status, categoryId, createdAt, updatedAt)
            VALUES
            (@code, @barcode, @name, @imageUrl, @baseUnit, @salePrice, @costPrice, @status, @categoryId, GETDATE(), GETDATE());
            SELECT SCOPE_IDENTITY() AS id;
        `);
    return result.recordset[0].id;
};

exports.updateProduct = async (id, productData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .input('code', sql.VarChar, productData.code)
        .input('barcode', sql.VarChar, productData.barcode)
        .input('name', sql.NVarChar, productData.name)
        .input('imageUrl', sql.NVarChar, productData.imageUrl || null)
        .input('baseUnit', sql.NVarChar, productData.baseUnit)
        .input('salePrice', sql.Decimal(18, 2), productData.salePrice)
        .input('costPrice', sql.Decimal(18, 2), productData.costPrice)
        .input('status', sql.VarChar, productData.status)
        .input('categoryId', sql.Int, productData.categoryId || null)
        .query(`
            UPDATE Products
            SET code = @code,
                barcode = @barcode,
                name = @name,
                imageUrl = @imageUrl,
                baseUnit = @baseUnit,
                salePrice = @salePrice,
                costPrice = @costPrice,
                status = @status,
                categoryId = @categoryId,
                updatedAt = GETDATE()
            WHERE id = @id
        `);

    return result.rowsAffected[0] > 0;
};

exports.stopSellingProduct = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
            UPDATE Products
            SET status = 'StopSelling',
                updatedAt = GETDATE()
            WHERE id = @id
        `);

    return result.rowsAffected[0] > 0;
};

exports.startSellingProduct = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
            UPDATE Products
            SET status = 'Selling',
                updatedAt = GETDATE()
            WHERE id = @id
        `);

    return result.rowsAffected[0] > 0;
};

exports.getProductById = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
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
                p.categoryId,
                c.name AS categoryName,
                ISNULL(s.quantityOnHand, 0) AS stockQuantity
            FROM Products p
            LEFT JOIN Categories c ON c.id = p.categoryId
            LEFT JOIN InventoryStocks s ON s.productId = p.id
            WHERE p.id = @id
        `);

    return result.recordset[0] || null;
};

exports.getProductWithBarcode = async (barcode) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input('barcode', sql.VarChar, barcode)
        .query(`
            SELECT
                id,
                name,
                baseUnit,
                salePrice,
                quantityOnHand
            FROM Products p
            JOIN InventoryStocks i ON p.id = i.productId
            WHERE barcode = @barcode
        `);
    return result.recordset[0] || null;
};

exports.getAllProducts = async (filters) => {
    const { search, page, pageSize, categoryId, status } = filters;
    const offset = (page - 1) * pageSize;

    const query = `
        ${categoryId ? `
        WITH CategoryTree AS (
            SELECT id FROM Categories WHERE id = @categoryId
            UNION ALL
            SELECT c.id
            FROM Categories c
            JOIN CategoryTree ct ON c.parentId = ct.id
        )` : ``}

        SELECT 
            p.[id], 
            p.[name], 
            p.[code],
            p.[imageUrl],
            p.[categoryId],
            ISNULL(s.[quantityOnHand], 0) AS [stock],
            s.[minThreshold],

            pu.[id] AS [unitId], 
            pu.[unitName],
            pu.[conversionFactor] AS [factor],
            pu.[barcode], 
            pu.[salePrice] AS [price],
            pu.[unitType]
        FROM (
            SELECT [id], [name], [code], [categoryId], [imageUrl]
            FROM [Products]
            WHERE [status] = @status
            AND (
                @search IS NULL
                OR [name] LIKE N'%' + @search + '%'
                OR [code] LIKE '%' + @search + '%'
                OR [id] IN (
                    SELECT [productId]
                    FROM [ProductUnits]
                    WHERE [barcode] = @search
                )
            )
            ${categoryId ? `AND [categoryId] IN (SELECT id FROM CategoryTree)` : ``}
            ORDER BY [id]
            OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
        ) AS p
        LEFT JOIN [InventoryStocks] s 
            ON p.[id] = s.[productId]
        LEFT JOIN [ProductUnits] pu 
            ON p.[id] = pu.[productId]
        ORDER BY p.[id], pu.[conversionFactor]
    `;

    const request = new sql.Request();
    request.input('search', sql.NVarChar, search || null);
    request.input('categoryId', sql.Int, categoryId || null);
    request.input('status', sql.VarChar, status || 'Selling');
    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const result = await request.query(query);
    return result.recordset;
};