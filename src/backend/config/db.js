const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cookingdb",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  connectTimeout: 10000,
  multipleStatements: false
});

db.connect((err) => {
  if (err) {
    console.log("❌ Kết nối MySQL thất bại:", err);
    return;
  }
  console.log("✅ Kết nối MySQL thành công!");
  
  // Verify columns exist
  db.query('SHOW COLUMNS FROM cong_thuc', (err, result) => {
    if (!err) {
      const columns = result.map(r => r.Field);
      console.log('📋 Cột trong bảng cong_thuc:', columns.join(', '));
    }
  });
});

module.exports = db;
