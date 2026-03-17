const { connectDB, sql } = require("../config/database");

const getProductsByCategory = async (
    categoryId,
    search,
    limit,
    offset
) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("categoryId", sql.BigInt, categoryId)
        .input("search", sql.NVarChar, `%${search}%`)
        .input("limit", sql.Int, limit)
        .input("offset", sql.Int, offset)
        .query(`
            SELECT
                c.name AS categoryName,
                p.id AS productId,
                p.name AS productName,
                p.code AS productCode,
                p.imageUrl,
                p.allowDecimalQuantity,
                p.baseUnit,
                s.quantityOnHand,
                s.minThreshold,
                CASE
                    WHEN s.quantityOnHand <= s.minThreshold THEN 'LOW'
                    ELSE 'NORMAL'
                END AS stockStatus
            FROM Products p
            JOIN Categories c ON c.id = p.categoryId
            LEFT JOIN InventoryStocks s ON s.productId = p.id
            WHERE p.categoryId = @categoryId
              AND (p.name LIKE @search OR p.code LIKE @search)
            ORDER BY p.name
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

    return result.recordset;
};

const countProductsByCategory = async (categoryId, search) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("categoryId", sql.BigInt, categoryId)
        .input("search", sql.NVarChar, `%${search}%`)
        .query(`
            SELECT COUNT(*) AS total
            FROM Products
            WHERE categoryId = @categoryId
              AND (name LIKE @search OR code LIKE @search)
        `);

    return result.recordset[0].total;
};

const updateStock = async (transaction, productId, difference) => {

    const result = await new sql.Request(transaction)
        .input("productId", sql.BigInt, productId)
        .input("difference", sql.Decimal(15, 3), difference)
        .query(`
            UPDATE InventoryStocks
            SET quantityOnHand = quantityOnHand + @difference
            WHERE productId = @productId
        `);

    return result.rowsAffected[0];
};

// Thêm hàm mới để lấy thông tin cơ bản sản phẩm (dùng trong controller)
const getProductBasicInfo = async (productId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("productId", sql.BigInt, productId)
        .query(`
            SELECT id, allowDecimalQuantity
            FROM Products
            WHERE id = @productId
        `);

    return result.recordset[0] || null;
};

const getProductsBySupplier = async (supplierId, search) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("supplierId", sql.Int, supplierId)
        .input("search", sql.NVarChar, `%${search}%`)
        .query(`
            SELECT 
                s.id AS supplierId,
                s.name AS supplierName,
                p.id AS productId,
                p.code,
                p.name,
                p.baseUnit,
                p.allowDecimalQuantity,
                p.costPrice,
                p.salePrice,
                p.status
            FROM Products p
            JOIN Suppliers s ON s.id = p.supplierId
            WHERE p.supplierId = @supplierId
              AND p.name LIKE @search
            ORDER BY p.name
        `);

    return result.recordset;
};

const countProductsBySupplier = async (supplierId, search) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("supplierId", sql.Int, supplierId)
        .input("search", sql.NVarChar, `%${search}%`)
        .query(`
            SELECT COUNT(*) AS total
            FROM Products
            WHERE supplierId = @supplierId
              AND name LIKE @search
        `);

    return result.recordset[0].total;
};

const searchProducts = async (keyword) => {
  const pool = await sql.connect();

  const result = await pool.request()
    .input("keyword", sql.NVarChar, `%${keyword}%`)
    .query(`
      SELECT TOP 20
          p.id,
          p.code,
          p.name,
          p.baseUnit,
          p.allowDecimalQuantity,

          ISNULL(s.quantityOnHand, 0) AS quantityOnHand,

          -- Thông tin unit lớn nhất (conversionFactor cao nhất)
          pu_largest.id AS largestUnitId,
          pu_largest.unitName AS largestUnitName,
          pu_largest.conversionFactor AS largestConversionFactor,

          -- Tính toán số lượng theo unit lớn nhất (dùng FLOOR và MOD)
          CASE 
              WHEN pu_largest.conversionFactor IS NOT NULL AND pu_largest.conversionFactor > 0 
              THEN FLOOR(ISNULL(s.quantityOnHand, 0) / pu_largest.conversionFactor)
              ELSE 0 
          END AS systemLargest,

          CASE 
              WHEN pu_largest.conversionFactor IS NOT NULL AND pu_largest.conversionFactor > 0 
              THEN ISNULL(s.quantityOnHand, 0) % pu_largest.conversionFactor
              ELSE ISNULL(s.quantityOnHand, 0) 
          END AS systemRemainder

      FROM Products p
      LEFT JOIN InventoryStocks s 
          ON p.id = s.productId

      -- Lấy unit lớn nhất (conversionFactor cao nhất)
      OUTER APPLY (
          SELECT TOP 1 
              id, unitName, conversionFactor
          FROM ProductUnits
          WHERE productId = p.id
          ORDER BY conversionFactor DESC
      ) pu_largest

      WHERE 
          p.status = 'Selling'
          AND (
              p.name LIKE @keyword
              OR p.code LIKE @keyword
          )
      ORDER BY p.name ASC
    `);

  return result.recordset;
};

const getStockByProductId = async (transaction, productId) => {
    const result = await new sql.Request(transaction)
        .input("productId", sql.BigInt, productId)
        .query(`
      SELECT productId, quantityOnHand
      FROM InventoryStocks WITH (UPDLOCK, ROWLOCK)
      WHERE productId = @productId
    `);

    return result.recordset[0] || null;
};

const deductStock = async (transaction, productId, quantity) => {
    await new sql.Request(transaction)
        .input("productId", sql.BigInt, productId)
        .input("quantity", sql.Decimal(15, 3), quantity)
        .query(`
      UPDATE InventoryStocks
      SET quantityOnHand = quantityOnHand - @quantity
      WHERE productId = @productId
    `);
};

const updateMinThreshold = async (productId, minThreshold) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("productId", sql.BigInt, productId)
        .input("minThreshold", sql.Decimal(15, 3), minThreshold)
        .query(`
            UPDATE InventoryStocks
            SET minThreshold = @minThreshold
            WHERE productId = @productId;

            SELECT * FROM InventoryStocks
            WHERE productId = @productId;
        `);

    return result.recordset[0];
};

const getLowStockProductUnits = async () => {

    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT
            pu.id AS productUnitId,
            pu.unitName,
            pu.conversionFactor,

            p.id AS productId,
            p.name AS productName,

            ISNULL(i.quantityOnHand,0) AS stockQuantity,
            i.minThreshold

        FROM ProductUnits pu

        JOIN Products p
            ON p.id = pu.productId

        JOIN SupplierProductPrices spp
            ON spp.unitId = pu.id

        LEFT JOIN InventoryStocks i
            ON i.productId = p.id

        WHERE pu.conversionFactor = (
            SELECT MAX(pu2.conversionFactor)
            FROM ProductUnits pu2
            WHERE pu2.productId = pu.productId
        )

        AND ISNULL(i.quantityOnHand,0) <= i.minThreshold

        ORDER BY stockQuantity ASC
    `);

    return result.recordset;

};

const searchProductUnits = async (keyword) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("keyword", sql.NVarChar, `%${keyword}%`)
        .query(`
            SELECT
                pu.id AS productUnitId,
                pu.unitName,

                p.id AS productId,
                p.name AS productName,

                spp.price,
                spp.createdAt

            FROM ProductUnits pu

            JOIN Products p
                ON p.id = pu.productId

            JOIN SupplierProductPrices spp
                ON spp.productId = p.id
                AND spp.unitId = pu.id

            JOIN (
                SELECT 
                    productId,
                    unitId,
                    MAX(createdAt) AS latestCreatedAt
                FROM SupplierProductPrices
                GROUP BY productId, unitId
            ) latest
                ON latest.productId = spp.productId
                AND latest.unitId = spp.unitId
                AND latest.latestCreatedAt = spp.createdAt

            WHERE p.name LIKE @keyword

            ORDER BY p.name
        `);

    return result.recordset;
};

const addStock = async (transaction, productId, quantity) => {

  const result = await new sql.Request(transaction)
    .input("productId", sql.BigInt, productId)
    .input("quantity", sql.Decimal(15, 3), quantity)
    .query(`
      UPDATE InventoryStocks
      SET quantityOnHand = quantityOnHand + @quantity
      WHERE productId = @productId
    `);

  return result.rowsAffected[0];
};

module.exports = {
    getStockByProductId,
    updateStock,
    deductStock,
    getProductsByCategory,
    countProductsByCategory,
    getProductBasicInfo,
    countProductsBySupplier,
    getProductsBySupplier,
    updateMinThreshold,
    searchProducts,
    getLowStockProductUnits,
    searchProductUnits,
    addStock,
}