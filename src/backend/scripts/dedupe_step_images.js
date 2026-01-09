const db = require('../config/db');

// Xoá bản ghi trùng (giữ lại id nhỏ nhất) theo bộ (recipe_id, step_index, image_url)
const sql = `
DELETE si1 FROM step_images si1
JOIN step_images si2
  ON si1.recipe_id = si2.recipe_id
 AND si1.step_index = si2.step_index
 AND si1.image_url = si2.image_url
 AND si1.id > si2.id;
`;

console.log('🧹 Đang xoá các ảnh bước bị trùng...');
db.query(sql, (err, result) => {
  if (err) {
    console.error('❌ Lỗi xoá trùng:', err.message);
    process.exit(1);
  }
  console.log(`✅ Đã xoá ${result.affectedRows || 0} bản ghi trùng trong step_images.`);
  process.exit(0);
});
