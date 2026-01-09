const db = require('../config/db');

console.log('Kiểm tra cấu trúc bảng cong_thuc...\n');

db.query('DESCRIBE cong_thuc', (err, result) => {
  if (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
  
  console.log('Cấu trúc bảng cong_thuc:');
  console.table(result);
  
  const hasServings = result.some(col => col.Field === 'servings');
  const hasCookTime = result.some(col => col.Field === 'cook_time');
  
  console.log('\n📊 Kết quả:');
  console.log(`  - Cột 'servings': ${hasServings ? '✅ Có' : '❌ Không có'}`);
  console.log(`  - Cột 'cook_time': ${hasCookTime ? '✅ Có' : '❌ Không có'}`);
  
  if (!hasServings || !hasCookTime) {
    console.log('\n⚠️ Cần chạy migration để thêm cột!');
  }
  
  process.exit(0);
});
