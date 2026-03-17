const { connectDB } = require("./src/config/database");

async function checkCurrentState() {
    try {
        const pool = await connectDB();

        console.log("--- ROLES ---");
        const roles = await pool.request().query("SELECT * FROM Roles");
        console.table(roles.recordset);

        console.log("\n--- USERS ---");
        const userModel = require("./src/models/user.model");
        console.log("\n--- TESTING userModel.findById(1) ---");
        const testUser = await userModel.findById(1);
        console.log("Result:", testUser);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCurrentState();
