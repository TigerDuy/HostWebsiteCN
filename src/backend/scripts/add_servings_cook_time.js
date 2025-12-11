const db = require('../config/db');

// Kiểm tra xem cột đã tồn tại chưa
db.query(
  `SHOW COLUMNS FROM cong_thuc LIKE 'servings'`,
  (err, result) => {
    if (err) {
      console.error('❌ Lỗi kiểm tra:', err.message);
      process.exit(1);
    }
    
    if (result.length > 0) {
      console.log('✅ Cột servings và cook_time đã tồn tại');
      process.exit(0);
    } else {
      // Thêm cột nếu chưa tồn tại
      db.query(
        `ALTER TABLE cong_thuc 
         ADD COLUMN servings VARCHAR(100) DEFAULT '0' AFTER image_url, 
         ADD COLUMN cook_time VARCHAR(100) DEFAULT '0' AFTER servings`,
        (err2, result2) => {
          if (err2) {
            console.error('❌ Lỗi thêm cột:', err2.message);
            process.exit(1);
          } else {
            console.log('✅ Đã thêm cột servings và cook_time thành công');
            process.exit(0);
          }
        }
      );
    }
  }
);
