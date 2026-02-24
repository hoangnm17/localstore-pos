const { sql, connectDB } = require("../config/database.js");

/* ==============================
   GET ALL SUPPLIERS (OPTIONAL SEARCH)
============================== */
exports.getList = async ({
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