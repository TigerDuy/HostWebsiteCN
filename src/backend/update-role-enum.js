const db = require('./config/db');

db.query("ALTER TABLE nguoi_dung MODIFY COLUMN role ENUM('user', 'moderator', 'admin') DEFAULT 'user'", (err) => {
  if (err) {
    console.log('Lỗi:', err.message);
  } else {
    console.log('✅ Cập nhật role ENUM thành công');
  }
  process.exit(0);
});
