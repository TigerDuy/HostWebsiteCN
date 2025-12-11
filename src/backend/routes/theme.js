const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

// 📥 Lấy theme preferences của user
router.get("/preferences", verifyToken, (req, res) => {
  const user_id = req.user.id;

  db.query(
    "SELECT primary_color, background_image, theme_name FROM user_theme_preferences WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi lấy cài đặt theme!" });
      }

      if (result.length === 0) {
        return res.json({
          primary_color: "#ff7f50",
          background_image: "",
          theme_name: "Default"
        });
      }

      res.json(result[0]);
    }
  );
});

// 💾 Lưu theme preferences của user
router.post("/preferences", verifyToken, (req, res) => {
  const user_id = req.user.id;
  const { primary_color, background_image, theme_name } = req.body;

  if (!primary_color) {
    return res.status(400).json({ message: "❌ Vui lòng cung cấp primary_color!" });
  }

  // Check if user already has preferences
  db.query(
    "SELECT id FROM user_theme_preferences WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi kiểm tra cài đặt!" });
      }

      if (result.length > 0) {
        // Update existing
        db.query(
          "UPDATE user_theme_preferences SET primary_color = ?, background_image = ?, theme_name = ? WHERE user_id = ?",
          [primary_color, background_image || null, theme_name || "Custom Theme", user_id],
          (err) => {
            if (err) {
              return res.status(500).json({ message: "❌ Lỗi cập nhật cài đặt!" });
            }
            res.json({ message: "✅ Đã lưu cài đặt giao diện!", updated: true });
          }
        );
      } else {
        // Insert new
        db.query(
          "INSERT INTO user_theme_preferences (user_id, primary_color, background_image, theme_name) VALUES (?, ?, ?, ?)",
          [user_id, primary_color, background_image || null, theme_name || "Custom Theme"],
          (err) => {
            if (err) {
              return res.status(500).json({ message: "❌ Lỗi tạo cài đặt!" });
            }
            res.json({ message: "✅ Đã tạo cài đặt giao diện!", created: true });
          }
        );
      }
    }
  );
});

// 📤 Export theme as JSON
router.get("/export", verifyToken, (req, res) => {
  const user_id = req.user.id;

  db.query(
    "SELECT primary_color, background_image, theme_name FROM user_theme_preferences WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi xuất giao diện!" });
      }

      const themeData = result.length > 0 ? result[0] : {
        primary_color: "#ff7f50",
        background_image: "",
        theme_name: "Default"
      };

      res.json(themeData);
    }
  );
});

// 📤 Chia sẻ theme (public)
router.post("/share", verifyToken, (req, res) => {
  const user_id = req.user.id;
  const { theme_name } = req.body;

  if (!theme_name) {
    return res.status(400).json({ message: "❌ Vui lòng cung cấp tên theme!" });
  }

  db.query(
    "UPDATE user_theme_preferences SET is_shared = TRUE, theme_name = ? WHERE user_id = ?",
    [theme_name, user_id],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi chia sẻ giao diện!" });
      }
      res.json({ message: "✅ Đã chia sẻ giao diện! Mọi người có thể tải theme của bạn" });
    }
  );
});

// 🌐 Lấy danh sách theme được chia sẻ (public)
router.get("/marketplace", verifyToken, (req, res) => {
  db.query(
    `SELECT 
      utp.id,
      utp.primary_color,
      utp.background_image,
      utp.theme_name,
      utp.created_at,
      u.username as created_by
    FROM user_theme_preferences utp
    JOIN users u ON utp.user_id = u.id
    WHERE utp.is_shared = TRUE
    ORDER BY utp.created_at DESC
    LIMIT 50`,
    (err, result) => {
      if (err) {
        console.error('Lỗi lấy marketplace:', err);
        return res.status(500).json({ message: "❌ Lỗi tải danh sách theme!" });
      }
      res.json(result || []);
    }
  );
});

module.exports = router;
