const db = require("../config/db");

console.log("🔍 Tìm kiếm tất cả ảnh:\n");

db.query(`
  SELECT id, title, image_url 
  FROM cong_thuc 
  ORDER BY id ASC
`, (err, results) => {
  if (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  }
  
  console.log(`Tổng số recipes: ${results.length}\n`);
  
  let with3002 = 0;
  let with3001 = 0;
  let other = 0;
  
  results.forEach(r => {
    if (r.image_url) {
      if (r.image_url.includes('localhost:3002')) {
        with3002++;
        console.log(`❌ ${r.id}. ${r.title}: ${r.image_url}`);
      } else if (r.image_url.includes('localhost:3001')) {
        with3001++;
      } else {
        other++;
      }
    }
  });
  
  console.log(`\n📊 Tóm tắt:`);
  console.log(`- Với localhost:3002: ${with3002}`);
  console.log(`- Với localhost:3001: ${with3001}`);
  console.log(`- Khác: ${other}`);
  
  if (with3002 > 0) {
    console.log(`\n🔧 Cần sửa ${with3002} ảnh...`);
    
    db.query(`
      UPDATE cong_thuc 
      SET image_url = REPLACE(image_url, 'localhost:3002', 'localhost:3001')
      WHERE image_url LIKE '%localhost:3002%'
    `, (err, result) => {
      if (err) {
        console.error("❌ Lỗi sửa:", err.message);
        process.exit(1);
      }
      console.log(`✅ Đã sửa ${result.affectedRows} ảnh!`);
      process.exit(0);
    });
  } else {
    console.log(`\n✅ Tất cả ảnh đã đúng!`);
    process.exit(0);
  }
});
