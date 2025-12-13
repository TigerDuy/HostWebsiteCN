require('dotenv').config();
const db = require('../config/db');

console.log('🔄 Thêm cột parent_comment_id vào bảng binh_luan...');

db.query(`
  ALTER TABLE binh_luan 
  ADD COLUMN parent_comment_id INT DEFAULT NULL,
  ADD FOREIGN KEY (parent_comment_id) REFERENCES binh_luan(id) ON DELETE CASCADE
`, (err) => {
  if (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️ Cột parent_comment_id đã tồn tại');
    } else {
      console.error('❌ Lỗi thêm cột:', err);
      process.exit(1);
    }
  } else {
    console.log('✅ Đã thêm cột parent_comment_id thành công!');
  }
  process.exit(0);
});
