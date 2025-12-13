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

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS bao_cao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      recipe_id INT NOT NULL,
      user_id INT NOT NULL,
      reason TEXT NOT NULL,
      status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
      rejected_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_report (recipe_id, user_id),
      FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  connection.query(createTableSQL, (err, result) => {
    if (err) {
      console.error('❌ Lỗi tạo bảng bao_cao:', err);
      connection.end();
      return;
    }

    console.log('✅ Tạo bảng bao_cao thành công!');
    connection.end();
  });
});
