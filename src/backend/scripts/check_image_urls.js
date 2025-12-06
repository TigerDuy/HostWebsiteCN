const db = require("../config/db");

console.log("📸 Kiểm tra URL ảnh trong database:\n");

db.query(`
  SELECT id, title, image_url 
  FROM cong_thuc 
  WHERE image_url LIKE '%localhost%'
  LIMIT 10
`, (err, results) => {
  if (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  }
  
  if (results.length === 0) {
    console.log("ℹ️  Không có ảnh nào có localhost trong URL!");
    console.log("\nKiểm tra tất cả ảnh:");
    
    db.query(`
      SELECT id, title, image_url 
      FROM cong_thuc 
      LIMIT 10
    `, (err, results) => {
      results.forEach(r => {
        console.log(`${r.id}. ${r.title}`);
        console.log(`   URL: ${r.image_url}\n`);
      });
      process.exit(0);
    });
  } else {
    results.forEach(r => {
      console.log(`${r.id}. ${r.title}`);
      console.log(`   URL: ${r.image_url}\n`);
    });
    process.exit(0);
  }
});
