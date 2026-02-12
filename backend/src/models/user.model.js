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
            .query("SELECT * FROM [Users] WHERE username = @email");

        return result.recordset[0];
    } catch (err) {
        throw err;
    }
}