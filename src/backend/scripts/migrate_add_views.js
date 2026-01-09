/**
 * Migration: Thêm cột views và bảng recipe_views
 * Chạy: node src/backend/scripts/migrate_add_views.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cookingdb'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Không thể kết nối database:', err.message);
    process.exit(1);
  }
  console.log('✅ Đã kết nối database');
  runMigration();
});

async function runMigration() {
  try {
    // 1. Thêm cột views vào bảng cong_thuc (nếu chưa có)
    console.log('\n📦 Kiểm tra cột views trong bảng cong_thuc...');
    
    const [columns] = await db.promise().query(
      "SHOW COLUMNS FROM cong_thuc LIKE 'views'"
    );
    
    if (columns.length === 0) {
      console.log('➕ Thêm cột views...');
      await db.promise().query(
        "ALTER TABLE cong_thuc ADD COLUMN views INT DEFAULT 0 AFTER cook_time"
      );
      console.log('✅ Đã thêm cột views');
    } else {
      console.log('✅ Cột views đã tồn tại');
    }

    // 2. Tạo bảng recipe_views (nếu chưa có)
    console.log('\n📦 Kiểm tra bảng recipe_views...');
    
    const [tables] = await db.promise().query(
      "SHOW TABLES LIKE 'recipe_views'"
    );
    
    if (tables.length === 0) {
      console.log('➕ Tạo bảng recipe_views...');
      await db.promise().query(`
        CREATE TABLE recipe_views (
          id INT PRIMARY KEY AUTO_INCREMENT,
          recipe_id INT NOT NULL,
          client_ip VARCHAR(45) NOT NULL,
          user_agent VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
          INDEX idx_recipe_views_lookup (recipe_id, client_ip, user_agent, created_at)
        )
      `);
      console.log('✅ Đã tạo bảng recipe_views');
    } else {
      console.log('✅ Bảng recipe_views đã tồn tại');
    }

    console.log('\n🎉 Migration hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi migration:', error.message);
    process.exit(1);
  }
}
