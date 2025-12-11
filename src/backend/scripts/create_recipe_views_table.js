const db = require('../config/db');

const createTableSQL = `
CREATE TABLE IF NOT EXISTS recipe_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  client_ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  INDEX idx_recipe_time (recipe_id, created_at),
  INDEX idx_ip_recipe (client_ip, recipe_id, created_at)
)`;

db.query(createTableSQL, (err) => {
  if (err) {
    console.error('❌ Lỗi tạo bảng:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Đã tạo bảng recipe_views thành công!');
  console.log('📋 Bảng này dùng để tracking lượt xem và chặn spam.');
  console.log('💡 Quy tắc: 1 IP chỉ tính 1 view/công thức/30 phút');
  process.exit(0);
});
