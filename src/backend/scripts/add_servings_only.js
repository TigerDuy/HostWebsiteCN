const db = require('../config/db');

db.query(
  `ALTER TABLE cong_thuc ADD COLUMN servings VARCHAR(100) DEFAULT '0' AFTER image_url`,
  (err) => {
    if (err) {
      console.error('❌ Lỗi:', err.message);
      process.exit(1);
    }
    console.log('✅ Đã thêm cột servings thành công');
    process.exit(0);
  }
);
