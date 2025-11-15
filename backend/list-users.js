const db = require("./config/db");

// Kiểm tra tất cả users
db.query(
  "SELECT id, username, email FROM nguoi_dung",
  (err, results) => {
    if (err) {
      console.log("❌ Lỗi truy vấn:", err.message);
    } else {
      console.log("📋 Danh sách tất cả users:");
      console.log("=====================================");
      results.forEach((user) => {
        console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
      });
      console.log("=====================================");
    }
    process.exit();
  }
);
