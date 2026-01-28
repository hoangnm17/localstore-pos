const sql = require("mssql")
const { connectDB } = require("../config/database")

module.exports.getAllInvoice = async () => {
    try {
        const pool = connectDB
        const result = pool
            .request()
            .query("SELECT * FROM [Invoices]")
        return result.recordset
    } catch (err) {
        console.log("Get All Invoice Error", err);
    }
}