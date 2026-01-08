const express = require("express");
const db = require("../config/db");
const { verifyToken, verifyAdminOrModerator } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/notifications"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "notif-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh"));
    }
  },
});

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
router.post("/send", verifyAdminOrModerator(db), upload.single("image"), (req, res) => {
  const senderId = req.user.id;
  const senderRole = req.user.role || null;
  const { receiver_id, message, type = "manual", metadata } = req.body;
  const imageUrl = req.file ? `/uploads/notifications/${req.file.filename}` : null;

  if (!receiver_id || !message || message.trim() === "") {
    return res.status(400).json({ message: "❌ Thiếu receiver_id hoặc message" });
  }

  const metaJson = toJsonOrNull(metadata ? JSON.parse(metadata) : null);

  db.query(
    `INSERT INTO notifications (sender_id, receiver_id, sender_role, type, message, image_url, metadata) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [senderId, receiver_id, senderRole, type, message, imageUrl, metaJson],
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi gửi thông báo:", err);
        return res.status(500).json({ message: "❌ Lỗi gửi thông báo" });
      }
      res.json({ message: "✅ Đã gửi thông báo", id: result.insertId });
    }
  );
});

// 📢 Gửi thông báo hàng loạt cho tất cả người dùng
router.post("/broadcast", verifyAdminOrModerator(db), upload.single("image"), (req, res) => {
  const senderId = req.user.id;
  const { message } = req.body;
  const imageUrl = req.file ? `/uploads/notifications/${req.file.filename}` : null;

  if (!message || message.trim() === "") {
    return res.status(400).json({ message: "❌ Vui lòng nhập nội dung thông báo" });
  }

  // Lưu broadcast notification
  db.query(
    `INSERT INTO broadcast_notifications (sender_id, message, image_url) VALUES (?, ?, ?)`,
    [senderId, message, imageUrl],
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi tạo broadcast:", err);
        return res.status(500).json({ message: "❌ Lỗi gửi thông báo hàng loạt" });
      }

      res.json({ 
        message: "✅ Đã gửi thông báo đến tất cả người dùng", 
        broadcastId: result.insertId 
      });
    }
  );
});

// 📥 Lấy thông báo của user hiện tại (bao gồm broadcast)
router.get("/my", verifyToken, (req, res) => {
  const userId = req.user.id;

  // Lấy thông báo cá nhân
  const personalQuery = `
    SELECT n.*, u.username as sender_name, 'personal' as notification_type
    FROM notifications n
    JOIN nguoi_dung u ON n.sender_id = u.id
    WHERE n.receiver_id = ?
  `;

  // Lấy broadcast chưa đọc
  const broadcastQuery = `
    SELECT 
      bn.id, bn.sender_id, bn.message, bn.image_url, bn.created_at,
      u.username as sender_name, 'broadcast' as notification_type,
      CASE WHEN ubr.id IS NOT NULL THEN TRUE ELSE FALSE END as is_read
    FROM broadcast_notifications bn
    JOIN nguoi_dung u ON bn.sender_id = u.id
    LEFT JOIN user_broadcast_read ubr ON bn.id = ubr.broadcast_id AND ubr.user_id = ?
  `;

  db.query(personalQuery, [userId], (err, personalNotifs) => {
    if (err) {
      console.error("❌ Lỗi lấy thông báo:", err);
      return res.status(500).json({ message: "❌ Lỗi lấy thông báo" });
    }

    db.query(broadcastQuery, [userId], (err2, broadcastNotifs) => {
      if (err2) {
        console.error("❌ Lỗi lấy broadcast:", err2);
        return res.status(500).json({ message: "❌ Lỗi lấy thông báo" });
      }

      // Kết hợp và sắp xếp theo thời gian
      const allNotifs = [...personalNotifs, ...broadcastNotifs].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      res.json(allNotifs);
    });
  });
});

// ✅ Đánh dấu đã đọc thông báo cá nhân
router.put("/:id/read", verifyToken, (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;

  db.query(
    "UPDATE notifications SET is_read = TRUE WHERE id = ? AND receiver_id = ?",
    [notificationId, userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi cập nhật" });
      }
      res.json({ message: "✅ Đã đánh dấu đã đọc" });
    }
  );
});

// ✅ Đánh dấu đã đọc broadcast
router.put("/broadcast/:id/read", verifyToken, (req, res) => {
  const broadcastId = req.params.id;
  const userId = req.user.id;

  db.query(
    `INSERT INTO user_broadcast_read (user_id, broadcast_id) VALUES (?, ?) ON CONFLICT (user_id, broadcast_id) DO NOTHING`,
    [userId, broadcastId],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi cập nhật" });
      }
      res.json({ message: "✅ Đã đánh dấu đã đọc" });
    }
  );
});

// 📩 Trả lời thông báo (gửi lại cho người gửi) - có thể kèm ảnh
router.post("/:id/reply", verifyToken, upload.single("image"), (req, res) => {
  const notificationId = req.params.id;
  const replySenderId = req.user.id;
  const replySenderRole = req.user.role || null;
  const { message } = req.body;
  const imageUrl = req.file ? `/uploads/notifications/${req.file.filename}` : null;

  if (!message || message.trim() === "") {
    return res.status(400).json({ message: "❌ Vui lòng nhập nội dung phản hồi" });
  }

  db.query(
    "SELECT sender_id, receiver_id, metadata FROM notifications WHERE id = ? AND receiver_id = ?",
    [notificationId, replySenderId],
    (err, rows) => {
      if (err) {
        console.error("❌ Lỗi kiểm tra thông báo:", err);
        return res.status(500).json({ message: "❌ Lỗi phản hồi" });
      }
      if (rows.length === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy thông báo hoặc bạn không phải người nhận" });
      }

      let meta = {};
      try {
        meta = rows[0].metadata ? JSON.parse(rows[0].metadata) : {};
      } catch (e) {
        meta = {};
      }

      if (meta && meta.has_reply) {
        return res.status(409).json({ message: "❌ Thông báo này đã được phản hồi" });
      }

      const originalSenderId = rows[0].sender_id;
      const metaJson = toJsonOrNull({ reply_to: notificationId });

      db.query(
        `INSERT INTO notifications (sender_id, receiver_id, sender_role, type, message, image_url, metadata) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [replySenderId, originalSenderId, replySenderRole, "reply", message, imageUrl, metaJson],
        (err2, result) => {
          if (err2) {
            console.error("❌ Lỗi gửi phản hồi:", err2);
            return res.status(500).json({ message: "❌ Lỗi gửi phản hồi" });
          }

          db.query(
            "UPDATE notifications SET metadata = COALESCE(metadata, '{}')::jsonb || ?::jsonb WHERE id = ?",
            [JSON.stringify({ has_reply: true, reply_id: result.insertId }), notificationId],
            (err3) => {
              if (err3) console.error("⚠️ Lỗi đánh dấu đã phản hồi:", err3);
              return res.json({ message: "✅ Đã gửi phản hồi", id: result.insertId });
            }
          );
        }
      );
    }
  );
});

// 📊 Trạng thái cảnh báo theo báo cáo
router.get("/report/:reportId/status", verifyAdminOrModerator(db), (req, res) => {
  const reportId = req.params.reportId;

  db.query(
    `SELECT n.id, n.metadata, n.created_at, n.image_url
     FROM notifications n
     WHERE n.type = 'report_warning'
       AND (n.metadata->>'report_id')::int = ?
     ORDER BY n.created_at DESC
     LIMIT 1`,
    [reportId],
    (err, rows) => {
      if (err) {
        console.error("❌ Lỗi lấy trạng thái cảnh báo:", err);
        return res.status(500).json({ message: "❌ Lỗi lấy trạng thái" });
      }

      if (rows.length === 0) {
        return res.json({ state: "none" });
      }

      const warning = rows[0];
      let meta = {};
      try {
        meta = typeof warning.metadata === 'string' ? JSON.parse(warning.metadata) : (warning.metadata || {});
      } catch (e) {
        meta = {};
      }

      const hasReply = meta.has_reply === true;

      if (!hasReply) {
        return res.json({ 
          state: "waiting", 
          warning_id: warning.id, 
          sent_at: warning.created_at,
          image_url: warning.image_url 
        });
      }

      db.query(
        `SELECT r.id, r.message, r.created_at, r.sender_role, r.image_url, u.username as sender_name
         FROM notifications r
         JOIN nguoi_dung u ON r.sender_id = u.id
         WHERE (r.metadata->>'reply_to')::int = ?
         ORDER BY r.created_at DESC
         LIMIT 1`,
        [warning.id],
        (err2, replies) => {
          if (err2) {
            console.error("❌ Lỗi lấy phản hồi cảnh báo:", err2);
            return res.status(500).json({ message: "❌ Lỗi lấy phản hồi" });
          }

          if (replies.length === 0) {
            return res.json({ state: "waiting", warning_id: warning.id, sent_at: warning.created_at });
          }

          const reply = replies[0];
          return res.json({
            state: "replied",
            warning_id: warning.id,
            sent_at: warning.created_at,
            reply: {
              id: reply.id,
              message: reply.message,
              created_at: reply.created_at,
              sender_name: reply.sender_name,
              sender_role: reply.sender_role,
              image_url: reply.image_url,
            },
          });
        }
      );
    }
  );
});

// 📋 Lấy danh sách broadcast (admin)
router.get("/broadcasts", verifyAdminOrModerator(db), (req, res) => {
  db.query(
    `SELECT bn.*, u.username as sender_name,
     (SELECT COUNT(*) FROM user_broadcast_read WHERE broadcast_id = bn.id) as read_count,
     (SELECT COUNT(*) FROM nguoi_dung) as total_users
     FROM broadcast_notifications bn
     JOIN nguoi_dung u ON bn.sender_id = u.id
     ORDER BY bn.created_at DESC`,
    (err, rows) => {
      if (err) {
        console.error("❌ Lỗi lấy broadcasts:", err);
        return res.status(500).json({ message: "❌ Lỗi lấy danh sách" });
      }
      res.json(rows);
    }
  );
});

// 🔢 Đếm thông báo chưa đọc
router.get("/unread-count", verifyToken, (req, res) => {
  const userId = req.user.id;

  const personalQuery = `SELECT COUNT(*) as count FROM notifications WHERE receiver_id = ? AND is_read = FALSE`;
  const broadcastQuery = `
    SELECT COUNT(*) as count FROM broadcast_notifications bn
    WHERE NOT EXISTS (SELECT 1 FROM user_broadcast_read WHERE broadcast_id = bn.id AND user_id = ?)
  `;

  db.query(personalQuery, [userId], (err, personalResult) => {
    if (err) return res.status(500).json({ message: "❌ Lỗi" });

    db.query(broadcastQuery, [userId], (err2, broadcastResult) => {
      if (err2) return res.status(500).json({ message: "❌ Lỗi" });

      const total = (personalResult[0]?.count || 0) + (broadcastResult[0]?.count || 0);
      res.json({ unread: total });
    });
  });
});

// ✅ Đánh dấu tất cả đã đọc
router.put("/read-all", verifyToken, (req, res) => {
  const userId = req.user.id;

  // Đánh dấu tất cả thông báo cá nhân đã đọc
  db.query(
    "UPDATE notifications SET is_read = TRUE WHERE receiver_id = ? AND is_read = FALSE",
    [userId],
    (err) => {
      if (err) {
        console.error("❌ Lỗi đánh dấu đã đọc:", err);
        return res.status(500).json({ message: "❌ Lỗi cập nhật" });
      }

      // Đánh dấu tất cả broadcast đã đọc
      db.query(
        `INSERT INTO user_broadcast_read (user_id, broadcast_id)
         SELECT ?, bn.id FROM broadcast_notifications bn
         WHERE NOT EXISTS (SELECT 1 FROM user_broadcast_read WHERE broadcast_id = bn.id AND user_id = ?)
         ON CONFLICT (user_id, broadcast_id) DO NOTHING`,
        [userId, userId],
        (err2) => {
          if (err2) {
            console.error("❌ Lỗi đánh dấu broadcast đã đọc:", err2);
            return res.status(500).json({ message: "❌ Lỗi cập nhật" });
          }
          res.json({ message: "✅ Đã đánh dấu tất cả đã đọc" });
        }
      );
    }
  );
});

module.exports = router;
