const { connectDB } = require("./src/config/database");
const bcrypt = require("bcrypt");

async function checkUsers() {
    try {
        const pool = await connectDB();
        const result = await pool.request().query("SELECT username, passwordHash FROM [Users]");
        console.log("Users in database:");
        for (const user of result.recordset) {
            const isMatch123456 = await bcrypt.compare("123456", user.passwordHash);
            const isMatchAdmin123 = await bcrypt.compare("admin123", user.passwordHash);
            console.log(`- Username: ${user.username}`);
            console.log(`  Is password "123456"? ${isMatch123456}`);
            console.log(`  Is password "admin123"? ${isMatchAdmin123}`);
        }
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkUsers();
