const { connectDB, sql } = require("../../config/database.js");

async function insertSalePriceHistory(transaction, {
    productId,
    productUnitId,
    oldSalePrice = null,
    newSalePrice,
    changedBy = null
}) {
    const request = new sql.Request(transaction);
    await request
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
            SELECT id
            FROM Categories
            WHERE id = @categoryId

            UNION ALL

            SELECT c.id
            FROM Categories c
            JOIN CategoryTree ct ON c.parentId = ct.id
        )
        ` : ``}
        SELECT
            p.id,
            p.code,
            p.name,
            p.imageUrl,
            p.baseUnit,
            p.allowDecimalQuantity,
            p.isCombo,
            p.status,
            p.categoryId,
            c.name AS categoryName,
            puBase.id AS baseUnitId,
            puBase.barcode AS barcode,
            puBase.salePrice AS salePrice,
            CASE
                WHEN p.isCombo = 1 THEN ISNULL(comboCost.costPrice, 0)
                ELSE ISNULL(latestCost.costPrice, 0)
            END AS costPrice,
            ISNULL(s.quantityOnHand, 0) AS stockQuantity
        FROM Products p
        LEFT JOIN Categories c
            ON c.id = p.categoryId
        LEFT JOIN ProductUnits puBase
            ON puBase.productId = p.id
           AND puBase.conversionFactor = 1
        LEFT JOIN InventoryStocks s
            ON s.productId = p.id
        OUTER APPLY (
            SELECT TOP 1 CAST(ROUND(poi.costPrice / NULLIF(CAST(puCost.conversionFactor AS DECIMAL(15, 3)), 0),0) AS DECIMAL(15, 0)) AS costPrice
            FROM PurchaseOrderItems poi
            INNER JOIN PurchaseOrders po
                ON po.id = poi.poId
            INNER JOIN ProductUnits puCost
                ON puCost.id = poi.productUnitId
            WHERE puCost.productId = p.id
                AND po.status = 'Received'
            ORDER BY po.createdAt DESC, poi.id DESC
        ) latestCost
        OUTER APPLY (
            SELECT ISNULL(SUM(pc.quantity * ISNULL(childLatest.costPrice, 0)), 0) AS costPrice
            FROM ProductCombos pc
            LEFT JOIN (
                SELECT
                    puC.productId,
                    CAST(ROUND(poiC.costPrice / NULLIF(CAST(puC.conversionFactor AS DECIMAL(15,3)), 0), 0) AS DECIMAL(15,0)) AS costPrice,
                    ROW_NUMBER() OVER (PARTITION BY puC.productId ORDER BY poC.createdAt DESC, poiC.id DESC) AS rn
                FROM PurchaseOrderItems poiC
                INNER JOIN PurchaseOrders poC ON poC.id = poiC.poId
                INNER JOIN ProductUnits puC ON puC.id = poiC.productUnitId
                WHERE poC.status = 'Received'
            ) childLatest ON childLatest.productId = pc.childProductId AND childLatest.rn = 1
            WHERE pc.parentProductId = p.id
        ) comboCost

        WHERE
    (@status IS NULL OR p.status = @status)
    AND (
        (@search = N'' OR @search IS NULL)
        OR (
            p.name COLLATE Latin1_General_CI_AI LIKE @searchLike
            OR p.code COLLATE Latin1_General_CI_AI LIKE @searchLike
            OR EXISTS (
                SELECT 1
                FROM ProductUnits pu
                WHERE pu.productId = p.id
                  AND (
                      pu.barcode COLLATE Latin1_General_CI_AI LIKE @searchLike
                      OR pu.unitName COLLATE Latin1_General_CI_AI LIKE @searchLike
                  )
            )
        )
    )
            ${categoryId ? `AND p.categoryId IN (SELECT id FROM CategoryTree)` : ``}
        ORDER BY p.createdAt DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const result = await pool.request()
        .input('search', sql.NVarChar(200), search)
        .input('searchLike', sql.NVarChar(210), `%${search}%`)
        .input('status', sql.VarChar(20), status || null)
        .input('categoryId', sql.Int, categoryId)
        .input('limit', sql.Int, Number(limit))
        .input('offset', sql.Int, Number(offset))
        .query(query);

    return result.recordset;
};

exports.countProducts = async (filters) => {
    const pool = await connectDB();
    const { search = '', categoryId = null, status = 'Selling' } = filters;

    const query = `
        ${categoryId ? `
        WITH CategoryTree AS (
            SELECT id
            FROM Categories
            WHERE id = @categoryId
            UNION ALL
            SELECT c.id
            FROM Categories c
            JOIN CategoryTree ct ON c.parentId = ct.id
        )
        ` : ``}
        SELECT COUNT(*) AS total
        FROM Products p
        WHERE
            (@status IS NULL OR p.status = @status)
            AND (
                @search = N''
                OR p.name COLLATE Latin1_General_CI_AI LIKE @searchLike
                OR p.code COLLATE Latin1_General_CI_AI LIKE @searchLike
                OR EXISTS (
                    SELECT 1
                    FROM ProductUnits pu
                    WHERE pu.productId = p.id
                      AND (
                          pu.barcode COLLATE Latin1_General_CI_AI LIKE @searchLike
                          OR pu.unitName COLLATE Latin1_General_CI_AI LIKE @searchLike
                      )
                )
            )
            ${categoryId ? `AND p.categoryId IN (SELECT id FROM CategoryTree)` : ``}
    `;

    const result = await pool.request()
        .input('search', sql.NVarChar(200), search)
        .input('searchLike', sql.NVarChar(210), `%${search}%`)
        .input('status', sql.VarChar(20), status || null)
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
                p.id,
                p.code,
                p.name,
                p.imageUrl,
                p.baseUnit,
                p.allowDecimalQuantity,
                p.isCombo,
                p.status,
                p.categoryId,
                c.name AS categoryName,
                puBase.id AS baseUnitId,
                puBase.barcode AS barcode,
                puBase.salePrice AS salePrice,
                CASE
                    WHEN p.isCombo = 1 THEN ISNULL(comboCost.costPrice, 0)
                    ELSE ISNULL(latestCost.costPrice, 0)
                END AS costPrice,
                ISNULL(s.minThreshold, 0) AS minThreshold,
                ISNULL(s.quantityOnHand, 0) AS stockQuantity
            FROM Products p
            LEFT JOIN Categories c
                ON c.id = p.categoryId
            LEFT JOIN ProductUnits puBase
                ON puBase.productId = p.id
               AND puBase.conversionFactor = 1
            LEFT JOIN InventoryStocks s
                ON s.productId = p.id
            OUTER APPLY (
                SELECT TOP 1 CAST(ROUND(poi.costPrice / NULLIF(CAST(puCost.conversionFactor AS DECIMAL(15, 3)), 0),0) AS DECIMAL(15, 0)) AS costPrice
                FROM PurchaseOrderItems poi
                INNER JOIN PurchaseOrders po
                    ON po.id = poi.poId
                INNER JOIN ProductUnits puCost
                    ON puCost.id = poi.productUnitId
                WHERE puCost.productId = p.id
                    AND po.status = 'Received'
                ORDER BY po.createdAt DESC, poi.id DESC
            ) latestCost
            OUTER APPLY (
                SELECT ISNULL(SUM(pc.quantity * ISNULL(childLatest.costPrice, 0)), 0) AS costPrice
                FROM ProductCombos pc
                LEFT JOIN (
                    SELECT
                        puC.productId,
                        CAST(ROUND(poiC.costPrice / NULLIF(CAST(puC.conversionFactor AS DECIMAL(15,3)), 0), 0) AS DECIMAL(15,0)) AS costPrice,
                        ROW_NUMBER() OVER (PARTITION BY puC.productId ORDER BY poC.createdAt DESC, poiC.id DESC) AS rn
                    FROM PurchaseOrderItems poiC
                    INNER JOIN PurchaseOrders poC ON poC.id = poiC.poId
                    INNER JOIN ProductUnits puC ON puC.id = poiC.productUnitId
                    WHERE poC.status = 'Received'
                ) childLatest ON childLatest.productId = pc.childProductId AND childLatest.rn = 1
                WHERE pc.parentProductId = p.id
            ) comboCost

            WHERE p.id = @id
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
                salePrice,
                salePrice AS price,
                barcode,
                CASE WHEN conversionFactor = 1 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS isBaseUnit
            FROM ProductUnits
            WHERE productId = @id
            ORDER BY conversionFactor ASC, id ASC
        `);

    return {
        ...productResult.recordset[0],
        hasMultiUnit: unitsResult.recordset.length > 1,
        units: unitsResult.recordset
    };
};

exports.getProductById = async (id) => {
    return exports.getProductDetail(id);
};

exports.getProductByBarcode = async (barcode) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input('barcode', sql.VarChar(50), barcode)
        .query(`
            SELECT TOP 1
                p.id AS productId,
                p.code,
                p.name,
                p.baseUnit,
                p.allowDecimalQuantity,
                p.isCombo,
                p.status,
                pu.id AS productUnitId,
                pu.unitName,
                pu.unitType,
                pu.conversionFactor,
                pu.salePrice,
                pu.salePrice AS price,
                pu.barcode,
                ISNULL(latestCost.costPrice, 0) AS costPrice,
                CASE
                    WHEN p.isCombo = 1 THEN ISNULL(comboStock.stockQuantity, 0)
                    ELSE ISNULL(s.quantityOnHand, 0)
                END AS stockQuantity
            FROM ProductUnits pu
            INNER JOIN Products p
                ON p.id = pu.productId
            LEFT JOIN InventoryStocks s
                ON s.productId = p.id
            OUTER APPLY (
            SELECT TOP 1 CAST(ROUND(poi.costPrice / NULLIF(CAST(puCost.conversionFactor AS DECIMAL(15, 3)), 0),0) AS DECIMAL(15, 0)) AS costPrice
            FROM PurchaseOrderItems poi
            INNER JOIN PurchaseOrders po
                ON po.id = poi.poId
            INNER JOIN ProductUnits puCost
                ON puCost.id = poi.productUnitId
            WHERE puCost.productId = p.id
                AND po.status = 'Received'
            ORDER BY po.createdAt DESC, poi.id DESC
            ) latestCost
            OUTER APPLY (
                SELECT MIN(FLOOR(ISNULL(cs.quantityOnHand, 0) / NULLIF(pc.quantity, 0))) AS stockQuantity
                FROM ProductCombos pc
                LEFT JOIN InventoryStocks cs
                    ON cs.productId = pc.childProductId
                WHERE pc.parentProductId = p.id
            ) comboStock
            WHERE pu.barcode = @barcode
        `);

    return result.recordset[0] || null;
};

exports.createProduct = async (productData) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const productRequest = new sql.Request(transaction);
        const productResult = await productRequest
            .input('code', sql.VarChar(50), productData.code)
            .input('name', sql.NVarChar(200), productData.name)
            .input('imageUrl', sql.NVarChar(500), productData.imageUrl || null)
            .input('baseUnit', sql.NVarChar(20), productData.baseUnit)
            .input('allowDecimalQuantity', sql.Bit, productData.allowDecimalQuantity ? 1 : 0)
            .input('isCombo', sql.Bit, productData.isCombo ? 1 : 0)
            .input('status', sql.VarChar(20), productData.status || 'Selling')
            .input('categoryId', sql.Int, productData.categoryId || null)
            .query(`
                INSERT INTO Products
                (code, imageUrl, name, categoryId, baseUnit, allowDecimalQuantity, isCombo, status, createdAt, updatedAt)
                OUTPUT INSERTED.id
                VALUES
                (@code, @imageUrl, @name, @categoryId, @baseUnit, @allowDecimalQuantity, @isCombo, @status, GETDATE(), GETDATE())
            `);

        const productId = productResult.recordset[0].id;

        const unitRequest = new sql.Request(transaction);
        const unitResult = await unitRequest
            .input('productId', sql.BigInt, productId)
            .input('unitName', sql.NVarChar(20), productData.baseUnit)
            .input('unitType', sql.VarChar(20), productData.allowDecimalQuantity ? 'WEIGHT' : 'PIECE')
            .input('salePrice', sql.Decimal(15, 2), Number(productData.salePrice || 0))
            .input('barcode', sql.VarChar(50), productData.barcode || null)
            .query(`
                INSERT INTO ProductUnits
                (productId, unitName, unitType, conversionFactor, salePrice, barcode)
                OUTPUT INSERTED.id
                VALUES
                (@productId, @unitName, @unitType, 1, @salePrice, @barcode)
            `);

        const baseUnitId = unitResult.recordset[0].id;

        await insertSalePriceHistory(transaction, {
            productId,
            productUnitId: baseUnitId,
            oldSalePrice: null,
            newSalePrice: Number(productData.salePrice || 0),
            changedBy: productData.createdBy || null
        });

        const stockRequest = new sql.Request(transaction);
        await stockRequest
            .input('productId', sql.BigInt, productId)
            .input('minThreshold', sql.Decimal(15, 3), Number(productData.minThreshold || 0))
            .query(`
                INSERT INTO InventoryStocks (productId, quantityOnHand, minThreshold)
                VALUES (@productId, 0, @minThreshold)
            `);

        await transaction.commit();
        return productId;
    } catch (err) {
        try { await transaction.rollback(); } catch (_) { }
        throw err;
    }
};

exports.updateProduct = async (id, productData) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const currentBaseUnitResult = await new sql.Request(transaction)
            .input('id', sql.BigInt, id)
            .query(`
                SELECT TOP 1 id, salePrice
                FROM ProductUnits
                WHERE productId = @id
                  AND conversionFactor = 1
            `);

        const currentBaseUnit = currentBaseUnitResult.recordset[0] || null;

        const updateProductResult = await new sql.Request(transaction)
            .input('id', sql.BigInt, id)
            .input('code', sql.VarChar(50), productData.code)
            .input('name', sql.NVarChar(200), productData.name)
            .input('imageUrl', sql.NVarChar(500), productData.imageUrl || null)
            .input('baseUnit', sql.NVarChar(20), productData.baseUnit)
            .input('allowDecimalQuantity', sql.Bit, productData.allowDecimalQuantity ? 1 : 0)
            .input('isCombo', sql.Bit, productData.isCombo ? 1 : 0)
            .input('status', sql.VarChar(20), productData.status || 'Selling')
            .input('categoryId', sql.Int, productData.categoryId || null)
            .query(`
                UPDATE Products
                SET
                    code = @code,
                    imageUrl = @imageUrl,
                    name = @name,
                    categoryId = @categoryId,
                    baseUnit = @baseUnit,
                    allowDecimalQuantity = @allowDecimalQuantity,
                    isCombo = @isCombo,
                    status = @status
                WHERE id = @id;

                SELECT @@ROWCOUNT AS affectedRows;
            `);

        if (!updateProductResult.recordset[0].affectedRows) {
            await transaction.rollback();
            return false;
        }

        const newSalePrice = Number(productData.salePrice || 0);

        if (currentBaseUnit) {
            await new sql.Request(transaction)
                .input('id', sql.Int, currentBaseUnit.id)
                .input('unitName', sql.NVarChar(20), productData.baseUnit)
                .input('unitType', sql.VarChar(20), productData.allowDecimalQuantity ? 'WEIGHT' : 'PIECE')
                .input('salePrice', sql.Decimal(15, 2), newSalePrice)
                .input('barcode', sql.VarChar(50), productData.barcode || null)
                .query(`
                    UPDATE ProductUnits
                    SET
                        unitName = @unitName,
                        unitType = @unitType,
                        salePrice = @salePrice,
                        barcode = @barcode
                    WHERE id = @id
                `);

            if (Number(currentBaseUnit.salePrice) !== newSalePrice) {
                await insertSalePriceHistory(transaction, {
                    productId: id,
                    productUnitId: currentBaseUnit.id,
                    oldSalePrice: Number(currentBaseUnit.salePrice),
                    newSalePrice,
                    changedBy: productData.updatedBy || null
                });
            }
        } else {
            const insertedBaseUnit = await new sql.Request(transaction)
                .input('productId', sql.BigInt, id)
                .input('unitName', sql.NVarChar(20), productData.baseUnit)
                .input('unitType', sql.VarChar(20), productData.allowDecimalQuantity ? 'WEIGHT' : 'PIECE')
                .input('salePrice', sql.Decimal(15, 2), newSalePrice)
                .input('barcode', sql.VarChar(50), productData.barcode || null)
                .query(`
                    INSERT INTO ProductUnits
                    (productId, unitName, unitType, conversionFactor, salePrice, barcode)
                    OUTPUT INSERTED.id
                    VALUES
                    (@productId, @unitName, @unitType, 1, @salePrice, @barcode)
                `);

            await insertSalePriceHistory(transaction, {
                productId: id,
                productUnitId: insertedBaseUnit.recordset[0].id,
                oldSalePrice: null,
                newSalePrice,
                changedBy: productData.updatedBy || null
            });
        }

        await new sql.Request(transaction)
            .input('productId', sql.BigInt, id)
            .input('minThreshold', sql.Decimal(15, 3), Number(productData.minThreshold || 0))
            .query(`
                IF EXISTS (SELECT 1 FROM InventoryStocks WHERE productId = @productId)
                BEGIN
                    UPDATE InventoryStocks
                    SET minThreshold = @minThreshold
                    WHERE productId = @productId
                END
                ELSE
                BEGIN
                    INSERT INTO InventoryStocks (productId, quantityOnHand, minThreshold)
                    VALUES (@productId, 0, @minThreshold)
                END
            `);

        await transaction.commit();
        return true;
    } catch (err) {
        try { await transaction.rollback(); } catch (_) { }
        throw err;
    }
};

exports.stopSellingProduct = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
            UPDATE Products
            SET status = 'StopSelling', updatedAt = GETDATE()
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
            SET status = 'Selling', updatedAt = GETDATE()
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
                p.name,
                p.imageUrl,
                p.baseUnit,
                p.allowDecimalQuantity,
                p.isCombo,
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

    // Phần điều kiện lọc chung (để dùng cho cả COUNT và SELECT)
    const filterConditions = `
        WHERE [status] = @status
        AND (
            @search IS NULL
            OR [name] LIKE N'%' + @search + '%'
            OR [code] LIKE '%' + @search + '%'
            OR [id] IN (
                SELECT [productId] FROM [ProductUnits] WHERE [barcode] = @search
            )
        )
        ${categoryId ? `AND [categoryId] IN (SELECT id FROM CategoryTree)` : ``}
    `;

    const query = `
        ${categoryId ? `
        WITH CategoryTree AS (
            SELECT id FROM Categories WHERE id = @categoryId
            UNION ALL
            SELECT c.id FROM Categories c JOIN CategoryTree ct ON c.parentId = ct.id
        )` : ``}

        -- Query 1: Đếm tổng số lượng sản phẩm thỏa điều kiện
        SELECT COUNT(*) AS total FROM [Products] ${filterConditions};

        -- Query 2: Lấy dữ liệu sản phẩm có phân trang
        SELECT 
            p.[id], p.[name], p.[code], p.[imageUrl], p.[categoryId],
            ISNULL(s.[quantityOnHand], 0) AS [stock], s.[minThreshold],
            pu.[id] AS [unitId], pu.[unitName], pu.[conversionFactor] AS [factor],
            pu.[barcode], pu.[salePrice] AS [price], pu.[unitType]
        FROM (
            SELECT [id], [name], [code], [categoryId], [imageUrl]
            FROM [Products]
            ${filterConditions}
            ORDER BY [id]
            OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
        ) AS p
        LEFT JOIN [InventoryStocks] s ON p.[id] = s.[productId]
        LEFT JOIN [ProductUnits] pu ON p.[id] = pu.[productId]
        ORDER BY p.[id], pu.[conversionFactor];
    `;

    const request = new sql.Request();
    request.input('search', sql.NVarChar, search || null);
    request.input('categoryId', sql.Int, categoryId || null);
    request.input('status', sql.VarChar, status || 'Selling');
    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const result = await request.query(query);
    
    return {
        total: result.recordsets[0][0].total, // Lấy từ query COUNT
        data: result.recordsets[1]            // Lấy từ query SELECT
    };
};

exports.getBarcodeProducts = async (filters) => {
  const { search, page = 1, pageSize = 10, categoryId, status } = filters;

  if (!search) return null;

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

    FROM [ProductUnits] pu
    JOIN [Products] p ON pu.productId = p.id
    LEFT JOIN [InventoryStocks] s ON p.id = s.productId

    WHERE pu.[barcode] = @search
    AND p.[status] = @status
    ${categoryId ? `AND p.[categoryId] IN (SELECT id FROM CategoryTree)` : ``}

    ORDER BY p.[id], pu.[conversionFactor]
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
  `;

  const request = new sql.Request();
  request.input("search", sql.VarChar, search);
  request.input("status", sql.VarChar, status || "Selling");
  request.input("categoryId", sql.Int, categoryId || null);
  request.input("offset", sql.Int, offset);
  request.input("pageSize", sql.Int, pageSize);

  const result = await request.query(query);

  // ❌ Không tìm thấy → return null
  if (result.recordset.length === 0) return null;

  return result.recordset;
};

exports.checkBarcodeExists = async (barcode, excludeProductId = null) => {
    if (!barcode || String(barcode).trim() === '') return false;

    const pool = await connectDB();
    const result = await pool.request()
        .input('barcode', sql.VarChar(50), barcode)
        .input('excludeProductId', sql.BigInt, excludeProductId)
        .query(`
            SELECT COUNT(*) as count
            FROM ProductUnits
            WHERE barcode = @barcode
            ${excludeProductId ? 'AND productId != @excludeProductId' : ''}
        `);

    return result.recordset[0].count > 0;
};