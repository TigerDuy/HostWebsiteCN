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
  
  // Cập nhật những báo cáo cũ đã xử lý nhưng chưa có processed_by
  // Gán processed_by = 1 (admin mặc định) và processed_at = updated_at
  conn.query(`
    UPDATE bao_cao 
    SET processed_by = 1, processed_at = updated_at
    WHERE (status = 'accepted' OR status = 'rejected') 
    AND processed_by IS NULL
  `, (err, result) => {
    if (err) {
      console.error('❌ Lỗi cập nhật:', err);
    } else {
      console.log('✅ Cập nhật thành công!');
      console.log('Số báo cáo được cập nhật:', result.affectedRows);
    }
    conn.end();
  });
});
