const db = require("../config/db");

const sql = `
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  sender_role VARCHAR(20) DEFAULT NULL,
  type VARCHAR(50) DEFAULT 'manual',
  message TEXT NOT NULL,
  metadata JSON DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_sender FOREIGN KEY (sender_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_receiver FOREIGN KEY (receiver_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  INDEX idx_notifications_receiver_created (receiver_id, created_at DESC)
);
`;

db.query(sql, (err) => {
  if (err) {
    console.error("❌ Lỗi tạo bảng notifications:", err);
    process.exit(1);
  }
  console.log("✅ Đã tạo bảng notifications (nếu chưa tồn tại)");
  process.exit(0);
});
