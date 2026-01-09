const db = require('../config/db');

const createTableSQL = `
CREATE TABLE IF NOT EXISTS step_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  step_index INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  INDEX idx_recipe_step (recipe_id, step_index)
)`;

db.query(createTableSQL, (err) => {
  if (err) {
    console.error('❌ Lỗi tạo bảng:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Đã tạo bảng step_images thành công!');
  console.log('📋 Bảng này dùng để lưu ảnh minh họa cho từng bước làm món ăn.');
  process.exit(0);
});
