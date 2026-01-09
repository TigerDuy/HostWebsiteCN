const db = require("../config/db");

console.log("🔄 Thêm cột avatar_url và bio vào bảng nguoi_dung...");

// Thêm cột avatar_url nếu chưa có
db.query(`
  ALTER TABLE nguoi_dung 
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS bio TEXT
`, (err) => {
  if (err) {
    console.error("❌ Lỗi thêm cột:", err.message);
    process.exit(1);
  }
  
  console.log("✅ Cột avatar_url và bio đã được thêm!");
  
  // Thêm cột views vào bảng cong_thuc nếu chưa có
  db.query(`
    ALTER TABLE cong_thuc 
    ADD COLUMN IF NOT EXISTS views INT DEFAULT 0
  `, (err) => {
    if (err) {
      console.error("❌ Lỗi thêm cột views:", err.message);
      process.exit(1);
    }
    
    console.log("✅ Cột views đã được thêm!");
    process.exit(0);
  });
});
