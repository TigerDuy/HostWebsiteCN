const db = require("../config/db");

/**
 * Script tạo bảng admin_hidden_recipes để lưu thông tin ẩn bài viết thủ công
 */

const createTableSQL = `
CREATE TABLE IF NOT EXISTS admin_hidden_recipes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  hidden_by INT NOT NULL COMMENT 'ID của admin/moderator thực hiện ẩn',
  reason TEXT NOT NULL COMMENT 'Lý do ẩn bài viết',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'TRUE = đang ẩn, FALSE = đã bỏ ẩn',
  unhidden_by INT NULL COMMENT 'ID của admin/moderator bỏ ẩn',
  unhidden_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  FOREIGN KEY (hidden_by) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  FOREIGN KEY (unhidden_by) REFERENCES nguoi_dung(id) ON DELETE SET NULL,
  KEY idx_recipe_active (recipe_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

console.log("🔧 Bắt đầu tạo bảng admin_hidden_recipes...");

db.query(createTableSQL, (err, result) => {
  if (err) {
    console.error("❌ Lỗi tạo bảng:", err);
    process.exit(1);
  }

  console.log("✅ Tạo bảng admin_hidden_recipes thành công!");
  console.log("📋 Cấu trúc bảng:");
  console.log("   - id: ID tự tăng");
  console.log("   - recipe_id: ID bài viết bị ẩn");
  console.log("   - hidden_by: ID admin/moderator thực hiện ẩn");
  console.log("   - reason: Lý do ẩn bài viết");
  console.log("   - is_active: Trạng thái ẩn (TRUE = đang ẩn, FALSE = đã bỏ ẩn)");
  console.log("   - unhidden_by: ID admin/moderator bỏ ẩn");
  console.log("   - unhidden_at: Thời điểm bỏ ẩn");
  console.log("   - created_at: Thời điểm tạo");

  db.end();
});
