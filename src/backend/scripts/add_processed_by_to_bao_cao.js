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

  // Kiểm tra xem cột đã tồn tại chưa, nếu chưa thì thêm
  const addColumnsSQL = `
    ALTER TABLE bao_cao
    ADD COLUMN IF NOT EXISTS processed_by INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP NULL DEFAULT NULL,
    ADD FOREIGN KEY (processed_by) REFERENCES nguoi_dung(id) ON DELETE SET NULL;
  `;

  connection.query(addColumnsSQL, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('✅ Cột processed_by đã tồn tại!');
        connection.end();
        return;
      }
      console.error('❌ Lỗi thêm cột:', err);
      connection.end();
      return;
    }

    console.log('✅ Thêm cột processed_by và processed_at thành công!');
    connection.end();
  });
});
