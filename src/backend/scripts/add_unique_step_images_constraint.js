const db = require('../config/db');

const sql = `
ALTER TABLE step_images
ADD CONSTRAINT uq_step_image UNIQUE (recipe_id, step_index, image_url);
`;

console.log('🔐 Thêm ràng buộc UNIQUE (recipe_id, step_index, image_url)...');
db.query(sql, (err) => {
  if (err) {
    if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_DUP_ENTRY' || /Duplicate|exists/i.test(err.message)) {
      console.log('ℹ️ UNIQUE đã tồn tại hoặc dữ liệu trùng, hãy chạy dedupe trước hoặc bỏ qua.');
      process.exit(0);
    }
    console.error('❌ Lỗi thêm UNIQUE:', err.message);
    process.exit(1);
  }
  console.log('✅ Đã thêm UNIQUE thành công.');
  process.exit(0);
});
