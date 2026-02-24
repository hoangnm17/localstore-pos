const sql = require("mssql")
const bcrypt = require("bcrypt")
const { connectDB } = require("../config/database")

module.exports.getAllUser = async () => {
    try {
        const pool = await connectDB()
        const result =  await pool
            .request()
            .query("SELECT * FROM [Users]")
        return result.recordset
    } catch (err) {
        console.error("getAllUser error:", err)
        throw err
    }

}
module.exports.findByEmail = async (email) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('email', sql.VarChar, email) 
            // .query(`
            //     SELECT u.*, r.name AS roleName 
            //     FROM [Users] u
            //     INNER JOIN [Roles] r ON u.roleId = r.id
            //     WHERE u.username = @email
            // `);
            .query(`
                SELECT 
                    u.*, 
                    r.name AS roleName,
                    (
                        -- Dùng STRING_AGG để gom các featureKey thành chuỗi cách nhau dấu phẩy
                        SELECT STRING_AGG(f.featureKey, ',') 
                        FROM RoleFeatures rf 
                        JOIN Features f ON rf.featureId = f.id 
                        WHERE rf.roleId = u.roleId
                    ) AS featureList
                FROM [Users] u
                INNER JOIN [Roles] r ON u.roleId = r.id
                WHERE u.username = @email
            `);

        return result.recordset[0];
    } catch (err) {
        throw err;
    }
}