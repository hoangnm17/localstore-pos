const sql = require("mssql")
const bcrypt = require("bcrypt")
const { connectDB } = require("../config/database")

module.exports.getAllUser = async () => {
    try {
        const pool = await connectDB()
        const result = pool
            .request()
            .query("SELECT * FROM [Users]")
        return result.recordset
    } catch (err) {
        console.error("getAllUser error:", err)
        throw err
    }

} 