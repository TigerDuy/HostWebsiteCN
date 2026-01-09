/**
 * Migration Script: Cập nhật hệ thống báo cáo v2
 * - Thêm các trường khóa tính năng cho người dùng
 * - Cập nhật bảng bao_cao với nhiều loại báo cáo
 * - Tạo bảng quota báo cáo
 * - Tạo bảng lịch sử vi phạm
 * - Cập nhật bảng notifications
 */

const db = require("../config/db");

const migrations = [
  // 1. Thêm các trường khóa tính năng cho nguoi_dung
  `ALTER TABLE nguoi_dung 
   ADD COLUMN IF NOT EXISTS is_posting_blocked BOOLEAN DEFAULT FALSE,
   ADD COLUMN IF NOT EXISTS posting_blocked_until DATETIME DEFAULT NULL,
   ADD COLUMN IF NOT EXISTS is_commenting_blocked BOOLEAN DEFAULT FALSE,
   ADD COLUMN IF NOT EXISTS commenting_blocked_until DATETIME DEFAULT NULL,
   ADD COLUMN IF NOT EXISTS is_reporting_blocked BOOLEAN DEFAULT FALSE,
   ADD COLUMN IF NOT EXISTS reporting_blocked_until DATETIME DEFAULT NULL,
   ADD COLUMN IF NOT EXISTS monthly_post_violations INT DEFAULT 0,
   ADD COLUMN IF NOT EXISTS monthly_comment_violations INT DEFAULT 0,
   ADD COLUMN IF NOT EXISTS monthly_rejected_reports INT DEFAULT 0,
   ADD COLUMN IF NOT EXISTS last_violation_reset DATETIME DEFAULT CURRENT_TIMESTAMP`,

  // 2. Thêm hidden_at cho cong_thuc
  `ALTER TABLE cong_thuc 
   ADD COLUMN IF NOT EXISTS hidden_at DATETIME DEFAULT NULL`,

  // 3. Cập nhật bảng bao_cao
  `ALTER TABLE bao_cao 
   ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) DEFAULT NULL,
   ADD COLUMN IF NOT EXISTS target_type ENUM('recipe', 'comment', 'user') DEFAULT 'recipe',
   ADD COLUMN IF NOT EXISTS comment_id INT DEFAULT NULL,
   ADD COLUMN IF NOT EXISTS reported_user_id INT DEFAULT NULL`,

  // 4. Tạo bảng user_report_quota
  `CREATE TABLE IF NOT EXISTS user_report_quota (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    report_type ENUM('recipe', 'comment', 'user') NOT NULL,
    remaining_reports INT DEFAULT 3,
    last_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_report_type (user_id, report_type)
  )`,

  // 5. Tạo bảng recipe_violation_history
  `CREATE TABLE IF NOT EXISTS recipe_violation_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    report_id INT NOT NULL,
    violated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES bao_cao(id) ON DELETE CASCADE
  )`,

  // 6. Tạo bảng comment_violation_history
  `CREATE TABLE IF NOT EXISTS comment_violation_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    report_id INT NOT NULL,
    violated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES bao_cao(id) ON DELETE CASCADE
  )`,

  // 7. Cập nhật bảng notifications
  `ALTER TABLE notifications 
   ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) DEFAULT NULL`,

  // 8. Tạo bảng broadcast_notifications
  `CREATE TABLE IF NOT EXISTS broadcast_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
  )`,

  // 9. Tạo bảng user_broadcast_read (theo dõi ai đã đọc broadcast)
  `CREATE TABLE IF NOT EXISTS user_broadcast_read (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    broadcast_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    FOREIGN KEY (broadcast_id) REFERENCES broadcast_notifications(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_broadcast (user_id, broadcast_id)
  )`,

  // 10. Indexes
  `CREATE INDEX IF NOT EXISTS idx_bao_cao_target_type ON bao_cao(target_type)`,
  `CREATE INDEX IF NOT EXISTS idx_bao_cao_comment ON bao_cao(comment_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bao_cao_reported_user ON bao_cao(reported_user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_violation_history_recipe ON recipe_violation_history(recipe_id)`,
  `CREATE INDEX IF NOT EXISTS idx_comment_violation_user ON comment_violation_history(user_id)`
];

async function runMigration() {
  console.log("🚀 Bắt đầu migration hệ thống báo cáo v2...\n");

  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i];
    const shortSql = sql.substring(0, 60).replace(/\n/g, " ") + "...";
    
    try {
      await new Promise((resolve, reject) => {
        db.query(sql, (err) => {
          if (err) {
            // Bỏ qua lỗi duplicate column/table
            if (err.code === "ER_DUP_FIELDNAME" || 
                err.code === "ER_TABLE_EXISTS_ERROR" ||
                err.code === "ER_DUP_KEYNAME" ||
                err.message.includes("Duplicate")) {
              console.log(`⚠️  [${i + 1}/${migrations.length}] Đã tồn tại: ${shortSql}`);
              resolve();
            } else {
              reject(err);
            }
          } else {
            console.log(`✅ [${i + 1}/${migrations.length}] Thành công: ${shortSql}`);
            resolve();
          }
        });
      });
    } catch (err) {
      console.error(`❌ [${i + 1}/${migrations.length}] Lỗi: ${shortSql}`);
      console.error("   Chi tiết:", err.message);
    }
  }

  console.log("\n✅ Migration hoàn tất!");
  process.exit(0);
}

runMigration();
