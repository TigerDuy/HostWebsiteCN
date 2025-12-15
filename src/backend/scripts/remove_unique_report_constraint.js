const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Kết nối MySQL thất bại:', err);
    return;
  }

  console.log('✅ Kết nối MySQL thành công!');

  // Xóa UNIQUE constraint để cho phép user báo cáo nhiều lần
  const dropConstraintSQL = `
    ALTER TABLE bao_cao DROP INDEX unique_report;
  `;

  connection.query(dropConstraintSQL, (err, result) => {
    if (err) {
      if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('⚠️ UNIQUE constraint unique_report không tồn tại hoặc đã bị xóa');
      } else {
        console.error('❌ Lỗi xóa UNIQUE constraint:', err);
      }
      connection.end();
      return;
    }

    console.log('✅ Đã xóa UNIQUE constraint unique_report thành công!');
    console.log('✅ Người dùng giờ có thể báo cáo lại sau 1 ngày kể từ lần xử lý cuối');
    connection.end();
  });
});
