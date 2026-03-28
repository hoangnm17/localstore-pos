// const { connectDB } = require("./src/config/database");
// (async () => {
//     try {
//         const pool = await connectDB();
//         const result = await pool.request().query("SELECT * FROM Roles");
//         console.log(JSON.stringify(result.recordset, null, 2));
//         process.exit(0);
//     } catch (err) {
//         console.error(err);
//         process.exit(1);
//     }
// })();
