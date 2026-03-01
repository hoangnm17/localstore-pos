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
                p.salePrice,
                ps.supplyPrice,
                p.imageUrl,
                ps.status
            FROM ProductSuppliers ps
            INNER JOIN Products p ON ps.productId = p.id
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
            p.barcode,
            p.salePrice
        FROM Products p
        ${whereClause}
        ORDER BY p.name ASC
    `);

    return result.recordset;
};

const addProductToSupplier = async (supplierId, productId, supplyPrice) => {
    const pool = await connectDB();

    await pool.request()
        .input("supplierId", sql.Int, supplierId)
        .input("productId", sql.BigInt, productId)
        .input("supplyPrice", sql.Decimal(15, 2), supplyPrice)
        .query(`
            INSERT INTO ProductSuppliers (productId, supplierId, supplyPrice)
            VALUES (@productId, @supplierId, @supplyPrice)
        `);
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
    supplyPrice,
    status
) => {

    const pool = await connectDB();

    await pool.request()
        .input("supplierId", sql.Int, supplierId)
        .input("productId", sql.BigInt, productId)
        .input("supplyPrice", sql.Decimal(15, 2), supplyPrice)
        .input("status", sql.VarChar(20), status)
        .query(`
            UPDATE ProductSuppliers
            SET supplyPrice = @supplyPrice,
                status = @status
            WHERE supplierId = @supplierId
            AND productId = @productId
        `);
};

module.exports = {
    getList,
    getById,
    getProductsBySupplier,
    getProductsNotInSupplier,
    addProductToSupplier,
    createSupplier,
    updateProductOfSupplier
};