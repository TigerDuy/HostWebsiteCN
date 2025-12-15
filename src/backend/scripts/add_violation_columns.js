const db = require('../config/db');

console.log('📝 Thêm cột violation_count và is_hidden vào bảng cong_thuc...\n');

const sql1 = `
ALTER TABLE cong_thuc 
ADD COLUMN violation_count INT DEFAULT 0,
ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE;
`;

db.query(sql1, (err) => {
  if (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ Cột violation_count hoặc is_hidden đã tồn tại.');
      process.exit(0);
    }
    console.error('❌ Lỗi thêm cột:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Đã thêm cột violation_count và is_hidden thành công!');
  console.log('📋 Bài viết sẽ tự ẩn khi violation_count >= 3.');
  process.exit(0);
});
