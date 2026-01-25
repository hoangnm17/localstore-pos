const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let pool;

const connectDB = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log("Connected to SQL Server!");
    }
    return pool;
  } catch (err) {
    console.error("Database connection failed!", err);
    throw err;
  }
};

module.exports = {
  sql,
  connectDB
}