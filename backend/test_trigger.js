const { connectDB } = require("./src/config/database");
const sql = require("mssql");

async function testUpdate() {
    try {
        const pool = await connectDB();
        console.log("Attempting to update customer status...");
        const result = await pool.request()
            .input('id', sql.BigInt, 2)
            .query(`
                UPDATE Customers
                SET status = 'Inactive'
                OUTPUT INSERTED.*
                WHERE id = @id
            `);
        console.log("Update successful:", result.recordset[0]);
        process.exit(0);
    } catch (err) {
        console.error("Error caught:", err.message);
        process.exit(1);
    }
}

testUpdate();
