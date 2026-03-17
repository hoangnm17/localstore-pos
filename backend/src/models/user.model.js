const sql = require("mssql");
const { connectDB } = require("../config/database");

const getAllUser = async () => {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT * FROM [Users]");
    return result.recordset;
};

const findByUsername = async (username) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query(`
                SELECT 
                    u.*, 
                    r.name AS roleName,
                    (SELECT STRING_AGG(f.featureKey, ',') FROM RoleFeatures rf 
                    JOIN Features f ON rf.featureId = f.id 
                    WHERE rf.roleId = u.roleId
                    ) AS featureList
                FROM [Users] u
                INNER JOIN [Roles] r ON u.roleId = r.id
                WHERE u.username = @username
            `);
        return result.recordset[0];
    } catch (err) {
        throw err;
    }
};

const findById = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM [Users] WHERE id = @id");
    return result.recordset[0];
};

module.exports = { getAllUser, findByUsername, findById };
