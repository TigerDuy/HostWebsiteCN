-- ✅ TẠO CƠ SỞ DỮ LIỆU
CREATE DATABASE IF NOT EXISTS cookingdb;
USE cookingdb;

-- ✅ BẢNG NGƯỜI DÙNG
CREATE TABLE nguoi_dung (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  avatar_url VARCHAR(500),
  bio TEXT,
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
  violation_count INT DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
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
