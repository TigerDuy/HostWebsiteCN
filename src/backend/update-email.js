const db = require("./config/db");

// Cập nhật email
const oldEmail = "duy@gmail.com";
const newEmail = "TigerDuy2000@gmail.com";

db.query(
  "UPDATE nguoi_dung SET email = ? WHERE email = ?",
  [newEmail, oldEmail],
  (err, result) => {
    if (err) {
      console.log("❌ Lỗi cập nhật email:", err.message);
    } else {
      console.log(`✅ Cập nhật thành công! Số dòng bị ảnh hưởng: ${result.affectedRows}`);
      console.log(`Email đã đổi từ: ${oldEmail} → ${newEmail}`);
    }
    process.exit();
  }
);
