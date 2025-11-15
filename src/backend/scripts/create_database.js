const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const sqlPath = path.resolve(__dirname, '..', '..', 'database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

    console.log('Kết nối MySQL để tạo database...');

    // Kết nối không chỉ định database để có thể tạo database mới
    const conn = await mysql.createConnection({ host, user, password, port, multipleStatements: true });

    await conn.query(sql);

    console.log('✅ Cấu trúc database đã được áp dụng từ', sqlPath);
    await conn.end();
  } catch (err) {
    console.error('❌ Lỗi khi tạo database:', err.message || err);
    process.exit(1);
  }
})();
