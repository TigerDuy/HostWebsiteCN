const express = require("express");
const db = require("../config/db");
const { verifyToken, verifyAdminOrModerator } = require("../middleware/auth");
const router = express.Router();

// Helper to serialize metadata safely
function toJsonOrNull(obj) {
  if (!obj) return null;
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return null;
  }
}

// 📤 Gửi thông báo đến user (admin/mod)
router.post("/send", verifyAdminOrModerator(db), (req, res) => {
  const senderId = req.user.id;
  const senderRole = req.user.role || null;
  const { receiver_id, message, type = "manual", metadata } = req.body;

  if (!receiver_id || !message || message.trim() === "") {
    return res.status(400).json({ message: "❌ Thiếu receiver_id hoặc message" });
  }

  const metaJson = toJsonOrNull(metadata);

  db.query(
    `INSERT INTO notifications (sender_id, receiver_id, sender_role, type, message, metadata) VALUES (?, ?, ?, ?, ?, ?)` ,
    [senderId, receiver_id, senderRole, type, message, metaJson],
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi gửi thông báo:", err);
        return res.status(500).json({ message: "❌ Lỗi gửi thông báo" });
      }
      res.json({ message: "✅ Đã gửi thông báo", id: result.insertId });
    }
  );
});

// 📥 Lấy thông báo của user hiện tại
router.get("/my", verifyToken, (req, res) => {
  const userId = req.user.id;
  db.query(
    `SELECT n.*, u.username as sender_name
     FROM notifications n
     JOIN nguoi_dung u ON n.sender_id = u.id
     WHERE n.receiver_id = ?
     ORDER BY n.created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("❌ Lỗi lấy thông báo:", err);
        return res.status(500).json({ message: "❌ Lỗi lấy thông báo" });
      }
      res.json(rows || []);
    }
  );
});

// 📩 Trả lời thông báo (gửi lại cho người gửi)
router.post("/:id/reply", verifyToken, (req, res) => {
  const notificationId = req.params.id;
  const replySenderId = req.user.id;
  const replySenderRole = req.user.role || null;
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ message: "❌ Vui lòng nhập nội dung phản hồi" });
  }

  db.query(
    "SELECT sender_id, receiver_id FROM notifications WHERE id = ? AND receiver_id = ?",
    [notificationId, replySenderId],
    (err, rows) => {
      if (err) {
        console.error("❌ Lỗi kiểm tra thông báo:", err);
        return res.status(500).json({ message: "❌ Lỗi phản hồi" });
      }
      if (rows.length === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy thông báo hoặc bạn không phải người nhận" });
      }
      const originalSenderId = rows[0].sender_id;
      const metaJson = toJsonOrNull({ reply_to: notificationId });
      db.query(
        `INSERT INTO notifications (sender_id, receiver_id, sender_role, type, message, metadata) VALUES (?, ?, ?, ?, ?, ?)` ,
        [replySenderId, originalSenderId, replySenderRole, "reply", message, metaJson],
        (err2, result) => {
          if (err2) {
            console.error("❌ Lỗi gửi phản hồi:", err2);
            return res.status(500).json({ message: "❌ Lỗi gửi phản hồi" });
          }
          res.json({ message: "✅ Đã gửi phản hồi", id: result.insertId });
        }
      );
    }
  );
});

module.exports = router;
