const db = require('../config/db');

console.log('Kiểm tra dữ liệu step_images...\n');

db.query('SELECT * FROM step_images ORDER BY recipe_id, step_index LIMIT 20', (err, result) => {
  if (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
  
  if (result.length === 0) {
    console.log('⚠️  Chưa có ảnh từng bước nào trong database');
    console.log('Bạn cần tạo công thức mới và upload ảnh cho từng bước.');
  } else {
    console.log(`✅ Có ${result.length} ảnh từng bước:\n`);
    console.table(result);
  }
  
  process.exit(0);
});
