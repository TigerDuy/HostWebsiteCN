const mysql = require('mysql2');
require('dotenv').config();

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

conn.connect((err) => {
  if (err) {
    console.error('❌ Kết nối thất bại:', err);
    return;
  }
  
  console.log('✅ Kết nối thành công!');
  
  // Check processed reports
  conn.query(`
    SELECT id, status, processed_by, processed_at 
    FROM bao_cao 
    WHERE status != 'pending' 
    LIMIT 5
  `, (err, rows) => {
    if (err) {
      console.error('❌ Lỗi query:', err);
    } else {
      console.log('📊 Báo cáo đã xử lý:');
      console.table(rows);
    }
    
    // Check all reports
    conn.query('SELECT COUNT(*) as total FROM bao_cao', (err, result) => {
      if (err) {
        console.error('❌ Lỗi:', err);
      } else {
        console.log('📊 Tổng báo cáo:', result[0].total);
      }
      
      // Check table structure
      conn.query('DESCRIBE bao_cao', (err, fields) => {
        if (err) {
          console.error('❌ Lỗi:', err);
        } else {
          console.log('📋 Cấu trúc bảng bao_cao:');
          console.table(fields);
        }
        conn.end();
      });
    });
  });
});
