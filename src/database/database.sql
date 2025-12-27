-- ✅ TẠO CƠ SỞ DỮ LIỆU
CREATE DATABASE IF NOT EXISTS cookingdb;
USE cookingdb;

-- ✅ BẢNG NGƯỜI DÙNG
CREATE TABLE nguoi_dung (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  avatar_url VARCHAR(500),
  bio TEXT,
  -- Các trường khóa tính năng
  is_posting_blocked BOOLEAN DEFAULT FALSE,
  posting_blocked_until DATETIME DEFAULT NULL,
  is_commenting_blocked BOOLEAN DEFAULT FALSE,
  commenting_blocked_until DATETIME DEFAULT NULL,
  is_reporting_blocked BOOLEAN DEFAULT FALSE,
  reporting_blocked_until DATETIME DEFAULT NULL,
  -- Đếm số lần vi phạm trong tháng
  monthly_post_violations INT DEFAULT 0,
  monthly_comment_violations INT DEFAULT 0,
  monthly_rejected_reports INT DEFAULT 0,
  last_violation_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ BẢNG CÔNG THỨC
CREATE TABLE cong_thuc (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  ingredients LONGTEXT NOT NULL,
  steps LONGTEXT NOT NULL,
  image_url VARCHAR(500),
  servings VARCHAR(100),
  cook_time VARCHAR(100),
  views INT DEFAULT 0,
  violation_count INT DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  hidden_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);

-- ✅ BẢNG THEO DÕI LƯỢT XEM (chống spam view)
CREATE TABLE recipe_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  client_ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  INDEX idx_recipe_views_lookup (recipe_id, client_ip, user_agent, created_at)
);

-- ✅ BẢNG ẢNH CÁC BƯỚC
CREATE TABLE step_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  step_index INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE
);

-- ✅ BẢNG BÌNH LUẬN
CREATE TABLE binh_luan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);

-- ✅ BẢNG YÊU THÍCH
CREATE TABLE favorite (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, recipe_id)
);

-- ✅ BẢNG ĐÁNH GIÁ
CREATE TABLE danh_gia (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rating (recipe_id, user_id)
);

-- ✅ INDEXES VỚI HiỆU NĂNG
CREATE INDEX idx_user_id ON cong_thuc(user_id);
CREATE INDEX idx_recipe_id ON binh_luan(recipe_id);
CREATE INDEX idx_recipe_id_favorite ON favorite(recipe_id);
CREATE INDEX idx_recipe_id_rating ON danh_gia(recipe_id);

-- ✅ BẢNG BÁO CÁO (cập nhật với nhiều loại báo cáo)
CREATE TABLE bao_cao (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  reason TEXT NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  rejected_reason TEXT DEFAULT NULL,
  processed_by INT DEFAULT NULL,
  processed_at DATETIME DEFAULT NULL,
  -- Loại báo cáo: recipe, comment, user
  target_type ENUM('recipe', 'comment', 'user') DEFAULT 'recipe',
  recipe_id INT DEFAULT NULL,
  comment_id INT DEFAULT NULL,
  reported_user_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES binh_luan(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES nguoi_dung(id) ON DELETE SET NULL
);

-- ✅ BẢNG QUOTA BÁO CÁO (giới hạn số lần báo cáo)
CREATE TABLE user_report_quota (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  report_type ENUM('recipe', 'comment', 'user') NOT NULL,
  remaining_reports INT DEFAULT 3,
  last_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_report_type (user_id, report_type)
);

-- ✅ BẢNG LỊCH SỬ VI PHẠM BÀI VIẾT (theo dõi vi phạm theo thời gian)
CREATE TABLE recipe_violation_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  report_id INT NOT NULL,
  violated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  FOREIGN KEY (report_id) REFERENCES bao_cao(id) ON DELETE CASCADE
);

-- ✅ BẢNG LỊCH SỬ VI PHẠM BÌNH LUẬN
CREATE TABLE comment_violation_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  comment_id INT NOT NULL,  -- Không có FK vì comment sẽ bị xóa
  user_id INT NOT NULL,
  report_id INT NOT NULL,
  violated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  FOREIGN KEY (report_id) REFERENCES bao_cao(id) ON DELETE CASCADE
);

-- ✅ BẢNG THÔNG BÁO
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  sender_role VARCHAR(20) DEFAULT NULL,
  type VARCHAR(50) DEFAULT 'manual',
  message TEXT NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);

-- ✅ BẢNG THÔNG BÁO HÀNG LOẠT
CREATE TABLE broadcast_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);

-- ✅ INDEXES CHO CÁC BẢNG MỚI
CREATE INDEX idx_bao_cao_recipe ON bao_cao(recipe_id);
CREATE INDEX idx_bao_cao_comment ON bao_cao(comment_id);
CREATE INDEX idx_bao_cao_user ON bao_cao(reported_user_id);
CREATE INDEX idx_bao_cao_status ON bao_cao(status);
CREATE INDEX idx_bao_cao_target_type ON bao_cao(target_type);
CREATE INDEX idx_violation_history_recipe ON recipe_violation_history(recipe_id);
CREATE INDEX idx_comment_violation_user ON comment_violation_history(user_id);
CREATE INDEX idx_comment_violation_date ON comment_violation_history(violated_at);
CREATE INDEX idx_notifications_receiver ON notifications(receiver_id);
CREATE INDEX idx_notifications_type ON notifications(type);
