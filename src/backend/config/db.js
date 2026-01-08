const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cookingdb",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
});

db.connect((err) => {
  if (err) {
    console.log("❌ Kết nối MySQL thất bại:", err.message);
    return;
  }
  console.log("✅ Kết nối MySQL thành công!");
});

module.exports = db;
