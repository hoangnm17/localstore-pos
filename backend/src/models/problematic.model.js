const { sql, connectDB } = require("../config/database.js");

exports.create = async ({ title, issueDescription, reportedBy }) => {
    const pool = await connectDB();

    return pool.request()
        .input("title", sql.NVarChar, title)
        .input("issueDescription", sql.NVarChar, issueDescription)
        .input("reportedBy", sql.BigInt, reportedBy)
        .query(`
            INSERT INTO ProblematicGoodsReport (title, issueDescription, reportedBy)
            VALUES (@title, @issueDescription, @reportedBy)
        `);
};

exports.getReports = async ({ userId, isManager, filters }) => {
    const pool = await connectDB();

    let query = `
        SELECT *
        FROM ProblematicGoodsReport
        WHERE 1=1
    `;

    const request = pool.request();

    // 🔹 Warehouse chỉ xem của mình
    if (!isManager) {
        query += " AND reportedBy = @userId";
        request.input("userId", sql.BigInt, userId);
    }

    // 🔹 Filter status
    if (filters.status) {
        query += " AND status = @status";
        request.input("status", sql.NVarChar, filters.status);
    }

    // 🔹 Filter ngày tạo
    if (filters.createdFrom) {
        query += " AND createdAt >= @createdFrom";
        request.input("createdFrom", sql.DateTime, filters.createdFrom);
    }

    if (filters.createdTo) {
        query += " AND createdAt <= @createdTo";
        request.input("createdTo", sql.DateTime, filters.createdTo);
    }

    query += " ORDER BY createdAt DESC";

    const result = await request.query(query);

    return result.recordset;
};
