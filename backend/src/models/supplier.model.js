const { sql, connectDB } = require("../config/database.js");

const getList = async ({
    search
}) => {

    const pool = await connectDB();
    const request = pool.request();

    let whereClause = "WHERE 1=1";

    if (search) {
        whereClause += " AND name LIKE @search";
        request.input("search", sql.NVarChar, `%${search}%`);
    }

    const result = await request.query(`
        SELECT 
            id,
            name,
            contactInfo,
            address
        FROM Suppliers
        ${whereClause}
        ORDER BY name ASC
    `);

    return result.recordset;
};

const getById = async (id) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            SELECT 
                id,
                name,
                contactInfo,
                address
            FROM Suppliers
            WHERE id = @id
        `);

    if (result.recordset.length === 0) return null;

    return result.recordset[0];
};

const getProductsBySupplier = async (supplierId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("supplierId", sql.Int, supplierId)
        .query(`
            SELECT 
                p.id,
                p.name,
                p.code,
                p.imageUrl,
                spp.price as supplyPrice,
                ps.status,
                pu.unitName,
                p.baseUnit
            FROM ProductSuppliers ps
            INNER JOIN Products p ON ps.productId = p.id

            OUTER APPLY (
                SELECT TOP 1 price, unitId
                FROM SupplierProductPrices
                WHERE productId = p.id
                AND supplierId = ps.supplierId
                ORDER BY createdAt DESC
            ) spp
            LEFT JOIN ProductUnits pu ON pu.id = spp.unitId

            WHERE ps.supplierId = @supplierId
            ORDER BY p.name ASC
        `);

    return result.recordset;
};

const getProductsNotInSupplier = async (supplierId, search) => {
    const pool = await connectDB();
    const request = pool.request()
        .input("supplierId", sql.Int, supplierId);

    let whereClause = `
        WHERE p.id NOT IN (
            SELECT productId 
            FROM ProductSuppliers
            WHERE supplierId = @supplierId
        )
    `;

    if (search) {
        whereClause += `
            AND (
                p.name LIKE @search
                OR p.code LIKE @search
                OR p.barcode LIKE @search
            )
        `;
        request.input("search", sql.NVarChar, `%${search}%`);
    }

    const result = await request.query(`
        SELECT 
            p.id,
            p.name,
            p.code,
            p.barcode
        FROM Products p
        ${whereClause}
        ORDER BY p.name ASC
    `);

    return result.recordset;
};

const getUnitsByProductId = async (productId) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("productId", sql.BigInt, productId)
        .query(`
            SELECT 
                id,
                productId,
                unitName,
                unitType,
                conversionFactor,
                price,
                barcode
            FROM ProductUnits
            WHERE productId = @productId
        `);

    return result.recordset;
};

const addProductToSupplier = async (supplierId, productId, price, productUnitId, userId) => {

    const pool = await connectDB();

    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {

        const request = new sql.Request(transaction);

        await request
            .input("supplierId", sql.Int, supplierId)
            .input("productId", sql.BigInt, productId)
            .query(`
                INSERT INTO ProductSuppliers (productId, supplierId)
                VALUES (@productId, @supplierId)
            `);

        await request
            .input("productUnitId", sql.Int, productUnitId)
            .input("price", sql.Decimal(15,2), price)
            .input("userId", sql.Int, userId)
            .query(`
                INSERT INTO SupplierProductPrices
                (productId, supplierId, unitId, price, createdBy)
                VALUES
                (@productId, @supplierId, @productUnitId, @price, @userId)
            `);

        await transaction.commit();

    } catch (err) {

        await transaction.rollback();
        throw err;
    }
};

const createSupplier = async ({
    name,
    contactInfo,
    address
}) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("name", sql.NVarChar, name)
        .input("contactInfo", sql.NVarChar, contactInfo || null)
        .input("address", sql.NVarChar, address || null)
        .query(`
            INSERT INTO Suppliers (name, contactInfo, address)
            OUTPUT INSERTED.*
            VALUES (@name, @contactInfo, @address)
        `);

    return result.recordset[0];
};

const updateProductOfSupplier = async (
    supplierId,
    productId,
    price,
    productUnitId,
    userId
) => {

    const pool = await connectDB();

    await pool.request()
        .input("supplierId", sql.Int, supplierId)
        .input("productId", sql.BigInt, productId)
        .input("productUnitId", sql.Int, productUnitId)
        .input("price", sql.Decimal(15,2), price)
        .input("userId", sql.Int, userId)
        .query(`
            INSERT INTO SupplierProductPrices
            (productId, supplierId, unitId, price, createdBy)
            VALUES
            (@productId, @supplierId, @productUnitId, @price, @userId)
        `);
};

const updateProductOfSupplierPrice = async (
    supplierId,
    productId,
    price,
    productUnitId,
    userId
) => {

    const pool = await connectDB();

    await pool.request()
        .input("supplierId", sql.Int, supplierId)
        .input("productId", sql.BigInt, productId)
        .input("productUnitId", sql.Int, productUnitId)
        .input("price", sql.Decimal(15,2), price)
        .input("userId", sql.Int, userId)
        .query(`
            INSERT INTO SupplierProductPrices
            (productId, supplierId, unitId, price, createdBy)
            VALUES
            (@productId, @supplierId, @productUnitId, @price, @userId)
        `);
};

const updateProductSupplierStatus = async (
    supplierId,
    productId,
    status
) => {

    const pool = await connectDB();

    await pool.request()
        .input("supplierId", sql.Int, supplierId)
        .input("productId", sql.BigInt, productId)
        .input("status", sql.VarChar(20), status)
        .query(`
            UPDATE ProductSuppliers
            SET status = @status
            WHERE supplierId = @supplierId
            AND productId = @productId
        `);
};

const updateSupplier = async (
    id,
    name,
    contactInfo,
    address
) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .input("name", sql.NVarChar, name)
        .input("contactInfo", sql.NVarChar, contactInfo || null)
        .input("address", sql.NVarChar, address || null)
        .query(`
            UPDATE Suppliers
            SET name = @name,
                contactInfo = @contactInfo,
                address = @address
            OUTPUT INSERTED.*
            WHERE id = @id
        `);

    return result.recordset[0];
};

const getPriceHistoryDetail = async (supplierId, productId) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("supplierId", sql.Int, supplierId)
        .input("productId", sql.BigInt, productId)
        .query(`
            SELECT 
                spp.id,
                spp.price,
                pu.unitName,
                spp.createdAt,
                st.fullName AS updatedBy
            FROM SupplierProductPrices spp

            JOIN ProductUnits pu 
                ON spp.unitId = pu.id

            LEFT JOIN Users u
                ON spp.createdBy = u.id

            LEFT JOIN Staff st
                ON st.userId = u.id

            WHERE spp.supplierId = @supplierId
            AND spp.productId = @productId

            ORDER BY spp.createdAt DESC
        `);

    return result.recordset;
};

module.exports = {
    getList,
    getById,
    getProductsBySupplier,
    getProductsNotInSupplier,
    addProductToSupplier,
    createSupplier,
    updateProductOfSupplier,
    updateSupplier,
    getUnitsByProductId,
    updateProductOfSupplierPrice,
    updateProductSupplierStatus,
    getPriceHistoryDetail
};