-- =============================================
-- CookShare Database Schema for PostgreSQL (Render.com)
-- =============================================

-- Tạo các ENUM types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE report_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE report_type AS ENUM ('user_report', 'admin_hide');
CREATE TYPE target_type AS ENUM ('recipe', 'comment', 'user');
CREATE TYPE category_type AS ENUM ('main', 'appetizer', 'dessert', 'drink', 'soup', 'salad', 'snack', 'other');
CREATE TYPE cuisine_type AS ENUM ('vietnam', 'korea', 'japan', 'china', 'thailand', 'italy', 'france', 'usa', 'other');

-- =============================================
-- BẢNG NGƯỜI DÙNG
-- =============================================
CREATE TABLE nguoi_dung (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user',
  avatar_url VARCHAR(500),
  bio TEXT,
  is_posting_blocked BOOLEAN DEFAULT FALSE,
  posting_blocked_until TIMESTAMP DEFAULT NULL,
  is_commenting_blocked BOOLEAN DEFAULT FALSE,
  commenting_blocked_until TIMESTAMP DEFAULT NULL,
  is_reporting_blocked BOOLEAN DEFAULT FALSE,
  reporting_blocked_until TIMESTAMP DEFAULT NULL,
  monthly_post_violations INT DEFAULT 0,
  monthly_comment_violations INT DEFAULT 0,
  monthly_rejected_reports INT DEFAULT 0,
  last_violation_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG CÔNG THỨC
-- =============================================
CREATE TABLE cong_thuc (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  cook_time VARCHAR(100) DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  servings VARCHAR(100) DEFAULT '0',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  views INT DEFAULT 0,
  violation_count INT DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  hidden_at TIMESTAMP DEFAULT NULL,
  category category_type DEFAULT 'other',
  cuisine cuisine_type DEFAULT 'other'
);

-- =============================================
-- BẢNG ADMIN ẨN BÀI VIẾT
-- =============================================
CREATE TABLE admin_hidden_recipes (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  hidden_by INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  unhidden_by INT DEFAULT NULL REFERENCES nguoi_dung(id) ON DELETE SET NULL,
  unhidden_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG BÁO CÁO
-- =============================================
CREATE TABLE bao_cao (
  id SERIAL PRIMARY KEY,
  recipe_id INT DEFAULT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status report_status DEFAULT 'pending',
  rejected_reason TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_by INT DEFAULT NULL REFERENCES nguoi_dung(id) ON DELETE SET NULL,
  processed_at TIMESTAMP DEFAULT NULL,
  report_type report_type DEFAULT 'user_report',
  image_url VARCHAR(500) DEFAULT NULL,
  target_type target_type DEFAULT 'recipe',
  comment_id INT DEFAULT NULL,
  reported_user_id INT DEFAULT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE
);

-- =============================================
-- BẢNG BÌNH LUẬN
-- =============================================
CREATE TABLE binh_luan (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  parent_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  parent_comment_id INT DEFAULT NULL
);

-- =============================================
-- BẢNG THÔNG BÁO BROADCAST
-- =============================================
CREATE TABLE broadcast_notifications (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG LIKE BÌNH LUẬN
-- =============================================
CREATE TABLE comment_likes (
  id SERIAL PRIMARY KEY,
  comment_id INT NOT NULL REFERENCES binh_luan(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
);

-- =============================================
-- BẢNG LỊCH SỬ VI PHẠM BÌNH LUẬN
-- =============================================
CREATE TABLE comment_violation_history (
  id SERIAL PRIMARY KEY,
  comment_id INT NOT NULL,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  report_id INT NOT NULL REFERENCES bao_cao(id) ON DELETE CASCADE,
  violated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG ĐÁNH GIÁ
-- =============================================
CREATE TABLE danh_gia (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id, user_id)
);

-- =============================================
-- BẢNG YÊU THÍCH
-- =============================================
CREATE TABLE favorite (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, recipe_id)
);

-- =============================================
-- BẢNG THEO DÕI
-- =============================================
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  following_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- =============================================
-- BẢNG THÔNG BÁO
-- =============================================
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  receiver_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'system',
  message TEXT NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sender_role VARCHAR(20) DEFAULT NULL,
  metadata JSONB DEFAULT NULL
);

-- =============================================
-- BẢNG LƯỢT XEM CÔNG THỨC
-- =============================================
CREATE TABLE recipe_views (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  client_ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG LỊCH SỬ VI PHẠM BÀI VIẾT
-- =============================================
CREATE TABLE recipe_violation_history (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  report_id INT NOT NULL REFERENCES bao_cao(id) ON DELETE CASCADE,
  violated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG ẢNH CÁC BƯỚC
-- =============================================
CREATE TABLE step_images (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  step_index INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG QUOTA BÁO CÁO
-- =============================================
CREATE TABLE user_report_quota (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  report_type target_type NOT NULL,
  remaining_reports INT DEFAULT 3,
  last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, report_type)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_cong_thuc_user_id ON cong_thuc(user_id);
CREATE INDEX idx_binh_luan_recipe_id ON binh_luan(recipe_id);
CREATE INDEX idx_favorite_recipe_id ON favorite(recipe_id);
CREATE INDEX idx_danh_gia_recipe_id ON danh_gia(recipe_id);
CREATE INDEX idx_bao_cao_status ON bao_cao(status);
CREATE INDEX idx_bao_cao_target_type ON bao_cao(target_type);
CREATE INDEX idx_notifications_receiver ON notifications(receiver_id);
CREATE INDEX idx_recipe_views_lookup ON recipe_views(recipe_id, client_ip, created_at);
