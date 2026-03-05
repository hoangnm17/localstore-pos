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
                p.allowDecimalQuantity,   -- thêm trường này để frontend biết
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

const updateStock = async (transaction, productId, quantity) => {

    const result = await new sql.Request(transaction)
        .input("productId", sql.BigInt, productId)
        .input("quantity", sql.Decimal(15, 3), quantity)
        .query(`
            UPDATE InventoryStocks
            SET quantityOnHand = @quantity
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
          p.barcode,
          p.name,
          p.baseUnit,
          p.salePrice,
          p.allowDecimalQuantity,
          ISNULL(s.quantityOnHand, 0) AS quantityOnHand
      FROM Products p
      LEFT JOIN InventoryStocks s 
          ON p.id = s.productId
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
    .input("productId", sql.Int, productId)
    .query(`
      SELECT quantityOnHand
      FROM InventoryStocks WITH (UPDLOCK, ROWLOCK)
      WHERE productId = @productId
    `);

  return result.recordset[0] || null;
};

const detuctStock = async (transaction, productId, quantity) => {
  await new sql.Request(transaction)
    .input("productId", sql.Int, productId)
    .input("quantity", sql.Decimal(15, 3), quantity)
    .query(`
      UPDATE InventoryStocks
      SET quantityOnHand = @quantity
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

module.exports = {
    getStockByProductId,
    updateStock,
    detuctStock,
    getProductsByCategory,
    countProductsByCategory,
    getProductBasicInfo,
    countProductsBySupplier,
    getProductsBySupplier,
    updateMinThreshold,
    searchProducts,
}