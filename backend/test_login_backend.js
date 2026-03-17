const authService = require("./src/services/auth.service");

async function testLogin() {
    try {
        console.log("Testing login for admin@gmail.com with password 123456...");
        const result = await authService.login("admin@gmail.com", "123456");
        console.log("Login SUCCESS:", result.user.username);
    } catch (err) {
        console.error("Login FAILED:", err.message);
    }
    process.exit(0);
}

testLogin();
