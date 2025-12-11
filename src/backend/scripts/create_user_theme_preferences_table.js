const db = require("../config/db");

// Create user_theme_preferences table
const createUserThemePreferencesTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_theme_preferences (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      primary_color VARCHAR(7) DEFAULT '#ff7f50',
      background_image LONGTEXT,
      theme_name VARCHAR(100),
      is_shared BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_id (user_id),
      INDEX idx_user_id (user_id)
    )
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Lỗi tạo bảng user_theme_preferences:", err);
      process.exit(1);
    }
    console.log("✅ Bảng user_theme_preferences đã được tạo thành công!");
    process.exit(0);
  });
};

createUserThemePreferencesTable();
