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
