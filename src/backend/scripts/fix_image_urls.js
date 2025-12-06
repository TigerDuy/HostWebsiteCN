const db = require("../config/db");

console.log("🔄 Sửa tất cả đường dẫn ảnh từ localhost:3002 thành localhost:3001...");

// Update tất cả records trong cong_thuc table
db.query(`
  UPDATE cong_thuc 
  SET image_url = REPLACE(image_url, 'localhost:3002', 'localhost:3001')
  WHERE image_url LIKE '%localhost:3002%'
`, (err, result) => {
  if (err) {
    console.error("❌ Lỗi sửa ảnh:", err.message);
    process.exit(1);
  }
  
  console.log(`✅ Đã sửa ${result.affectedRows} bản ghi ảnh công thức!`);
  
  // Update tất cả records trong nguoi_dung table
  db.query(`
    UPDATE nguoi_dung 
    SET avatar_url = REPLACE(avatar_url, 'localhost:3002', 'localhost:3001')
    WHERE avatar_url LIKE '%localhost:3002%'
  `, (err, result) => {
    if (err) {
      console.error("❌ Lỗi sửa avatar:", err.message);
      process.exit(1);
    }
    
    console.log(`✅ Đã sửa ${result.affectedRows} bản ghi avatar!`);
    console.log("✨ Tất cả đường dẫn ảnh đã được cập nhật!");
    process.exit(0);
  });
});
