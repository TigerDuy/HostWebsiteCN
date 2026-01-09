require('dotenv').config();
const db = require('../config/db');

console.log('🔄 Tạo bảng comment_likes...');

db.query(`
  CREATE TABLE IF NOT EXISTS comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES binh_luan(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (comment_id, user_id)
  )
`, (err) => {
  if (err) {
    console.error('❌ Lỗi tạo bảng:', err);
    process.exit(1);
  }
  console.log('✅ Đã tạo bảng comment_likes thành công!');
  process.exit(0);
});
