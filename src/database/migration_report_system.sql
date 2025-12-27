-- ✅ MIGRATION: Hệ thống báo cáo hoàn chỉnh
-- Chạy file này để đảm bảo tất cả bảng cần thiết đã được tạo

-- 1. Bảng quota báo cáo
CREATE TABLE IF NOT EXISTS user_report_quota (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  report_type ENUM('recipe', 'comment', 'user') NOT NULL,
  remaining_reports INT DEFAULT 3,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_type (user_id, report_type),
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);

-- 2. Bảng lịch sử vi phạm bài viết
CREATE TABLE IF NOT EXISTS recipe_violation_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  report_id INT NOT NULL,
  violated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  FOREIGN KEY (report_id) REFERENCES bao_cao(id) ON DELETE CASCADE
);

-- 3. Bảng lịch sử vi phạm bình luận (KHÔNG có FK đến binh_luan vì comment sẽ bị xóa)
CREATE TABLE IF NOT EXISTS comment_violation_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  comment_id INT NOT NULL,  -- Lưu ID để tham khảo, không có FK vì comment sẽ bị xóa
  user_id INT NOT NULL,
  report_id INT NOT NULL,
  violated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  FOREIGN KEY (report_id) REFERENCES bao_cao(id) ON DELETE CASCADE
);

-- 4. Thêm các cột cần thiết vào bảng nguoi_dung (nếu chưa có)
ALTER TABLE nguoi_dung 
  ADD COLUMN IF NOT EXISTS is_reporting_blocked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reporting_blocked_until DATETIME NULL,
  ADD COLUMN IF NOT EXISTS is_posting_blocked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS posting_blocked_until DATETIME NULL,
  ADD COLUMN IF NOT EXISTS is_commenting_blocked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS commenting_blocked_until DATETIME NULL;

-- 5. Thêm các cột cần thiết vào bảng cong_thuc (nếu chưa có)
ALTER TABLE cong_thuc
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hidden_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS violation_count INT DEFAULT 0;

-- 6. Thêm các cột cần thiết vào bảng bao_cao (nếu chưa có)
ALTER TABLE bao_cao
  ADD COLUMN IF NOT EXISTS comment_id INT NULL,
  ADD COLUMN IF NOT EXISTS reported_user_id INT NULL,
  ADD COLUMN IF NOT EXISTS target_type ENUM('recipe', 'comment', 'user') DEFAULT 'recipe',
  ADD COLUMN IF NOT EXISTS rejected_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS processed_by INT NULL,
  ADD COLUMN IF NOT EXISTS processed_at DATETIME NULL;

-- 7. Tạo index để tối ưu query
CREATE INDEX IF NOT EXISTS idx_comment_violation_user ON comment_violation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_violation_date ON comment_violation_history(violated_at);
CREATE INDEX IF NOT EXISTS idx_recipe_violation_recipe ON recipe_violation_history(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_violation_date ON recipe_violation_history(violated_at);
CREATE INDEX IF NOT EXISTS idx_report_quota_user ON user_report_quota(user_id);
CREATE INDEX IF NOT EXISTS idx_bao_cao_target ON bao_cao(target_type, status);

-- ✅ Hoàn tất migration
