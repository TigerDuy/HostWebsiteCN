-- PostgreSQL Schema for CookShare

-- ENUM types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE report_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE report_target AS ENUM ('recipe', 'comment', 'user');

-- Users table
CREATE TABLE nguoi_dung (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user',
  avatar_url VARCHAR(500),
  bio TEXT,
  is_posting_blocked BOOLEAN DEFAULT FALSE,
  posting_blocked_until TIMESTAMP,
  is_commenting_blocked BOOLEAN DEFAULT FALSE,
  commenting_blocked_until TIMESTAMP,
  is_reporting_blocked BOOLEAN DEFAULT FALSE,
  reporting_blocked_until TIMESTAMP,
  monthly_post_violations INT DEFAULT 0,
  monthly_comment_violations INT DEFAULT 0,
  monthly_rejected_reports INT DEFAULT 0,
  last_violation_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  password_reset_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes table
CREATE TABLE cong_thuc (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  image_url VARCHAR(500),
  servings VARCHAR(100),
  cook_time VARCHAR(100),
  category VARCHAR(50) DEFAULT 'other',
  cuisine VARCHAR(50) DEFAULT 'other',
  views INT DEFAULT 0,
  violation_count INT DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  hidden_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe views (anti-spam)
CREATE TABLE recipe_views (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  client_ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step images
CREATE TABLE step_images (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  step_index INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments
CREATE TABLE binh_luan (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  parent_comment_id INT REFERENCES binh_luan(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comment likes
CREATE TABLE comment_likes (
  id SERIAL PRIMARY KEY,
  comment_id INT NOT NULL REFERENCES binh_luan(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
);

-- Favorites
CREATE TABLE favorite (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, recipe_id)
);

-- Ratings
CREATE TABLE danh_gia (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id, user_id)
);

-- Follows
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  following_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- Tags
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe tags
CREATE TABLE recipe_tags (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(recipe_id, tag_id)
);

-- Reports
CREATE TABLE bao_cao (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  image_url VARCHAR(500),
  status report_status DEFAULT 'pending',
  rejected_reason TEXT,
  processed_by INT REFERENCES nguoi_dung(id) ON DELETE SET NULL,
  processed_at TIMESTAMP,
  target_type report_target DEFAULT 'recipe',
  recipe_id INT REFERENCES cong_thuc(id) ON DELETE CASCADE,
  comment_id INT REFERENCES binh_luan(id) ON DELETE CASCADE,
  reported_user_id INT REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Report quota
CREATE TABLE user_report_quota (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  report_type report_target NOT NULL,
  remaining_reports INT DEFAULT 3,
  last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, report_type)
);

-- Recipe violation history
CREATE TABLE recipe_violation_history (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  report_id INT NOT NULL REFERENCES bao_cao(id) ON DELETE CASCADE,
  violated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comment violation history
CREATE TABLE comment_violation_history (
  id SERIAL PRIMARY KEY,
  comment_id INT NOT NULL,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  report_id INT NOT NULL REFERENCES bao_cao(id) ON DELETE CASCADE,
  violated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  receiver_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  sender_role VARCHAR(20),
  type VARCHAR(50) DEFAULT 'manual',
  message TEXT NOT NULL,
  image_url VARCHAR(500),
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Broadcast notifications
CREATE TABLE broadcast_notifications (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User broadcast read
CREATE TABLE user_broadcast_read (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  broadcast_id INT NOT NULL REFERENCES broadcast_notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, broadcast_id)
);

-- Theme preferences
CREATE TABLE user_theme_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  theme_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Admin hidden recipes
CREATE TABLE admin_hidden_recipes (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  hidden_by INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  reason TEXT,
  hidden_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id)
);

-- Indexes
CREATE INDEX idx_cong_thuc_user ON cong_thuc(user_id);
CREATE INDEX idx_binh_luan_recipe ON binh_luan(recipe_id);
CREATE INDEX idx_favorite_recipe ON favorite(recipe_id);
CREATE INDEX idx_danh_gia_recipe ON danh_gia(recipe_id);
CREATE INDEX idx_bao_cao_status ON bao_cao(status);
CREATE INDEX idx_notifications_receiver ON notifications(receiver_id);
CREATE INDEX idx_recipe_views_lookup ON recipe_views(recipe_id, client_ip, created_at);
