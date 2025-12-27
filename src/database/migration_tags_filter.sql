-- ✅ MIGRATION: Thêm Tags, Category, Cuisine cho công thức

-- 1. Thêm cột category và cuisine vào bảng cong_thuc
ALTER TABLE cong_thuc 
ADD COLUMN category ENUM('main', 'appetizer', 'dessert', 'drink', 'soup', 'salad', 'snack', 'other') DEFAULT 'other',
ADD COLUMN cuisine ENUM('vietnam', 'korea', 'japan', 'china', 'thailand', 'italy', 'france', 'usa', 'other') DEFAULT 'other';

-- 2. Bảng tags
CREATE TABLE IF NOT EXISTS tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng liên kết recipe - tags (many-to-many)
CREATE TABLE IF NOT EXISTS recipe_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_recipe_tag (recipe_id, tag_id)
);

-- 4. Index cho performance
CREATE INDEX idx_recipe_category ON cong_thuc(category);
CREATE INDEX idx_recipe_cuisine ON cong_thuc(cuisine);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_recipe_tags_recipe ON recipe_tags(recipe_id);
CREATE INDEX idx_recipe_tags_tag ON recipe_tags(tag_id);

-- 5. Thêm một số tags mặc định
INSERT INTO tags (name, slug) VALUES 
('Dễ làm', 'de-lam'),
('Nhanh gọn', 'nhanh-gon'),
('Healthy', 'healthy'),
('Ít calo', 'it-calo'),
('Chay', 'chay'),
('Không gluten', 'khong-gluten'),
('Cho trẻ em', 'cho-tre-em'),
('Tiệc tùng', 'tiec-tung'),
('Ngày lễ', 'ngay-le'),
('Gia đình', 'gia-dinh')
ON DUPLICATE KEY UPDATE usage_count = usage_count;
