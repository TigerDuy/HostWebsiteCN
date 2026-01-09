const express = require("express");
const db = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const router = express.Router();

// 📥 Lấy theme preferences của user
router.get("/preferences", verifyToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await db.query(
      "SELECT primary_color, background_image, theme_name FROM user_theme_preferences WHERE user_id = $1",
      [user_id]
    );

    if (result.length === 0) {
      return res.json({
        primary_color: "#ff7f50",
        background_image: "",
        theme_name: "Default"
      });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("❌ Lỗi lấy cài đặt theme:", err);
    res.status(500).json({ message: "❌ Lỗi lấy cài đặt theme!" });
  }
});

// 💾 Lưu theme preferences của user
router.post("/preferences", verifyToken, async (req, res) => {
  const user_id = req.user.id;
  const { primary_color, background_image, theme_name } = req.body;

  if (!primary_color) {
    return res.status(400).json({ message: "❌ Vui lòng cung cấp primary_color!" });
  }

  try {
    const existing = await db.query(
      "SELECT id FROM user_theme_preferences WHERE user_id = $1",
      [user_id]
    );

    if (existing.length > 0) {
      await db.query(
        "UPDATE user_theme_preferences SET primary_color = $1, background_image = $2, theme_name = $3 WHERE user_id = $4",
        [primary_color, background_image || null, theme_name || "Custom Theme", user_id]
      );
      res.json({ message: "✅ Đã lưu cài đặt giao diện!", updated: true });
    } else {
      await db.query(
        "INSERT INTO user_theme_preferences (user_id, primary_color, background_image, theme_name) VALUES ($1, $2, $3, $4)",
        [user_id, primary_color, background_image || null, theme_name || "Custom Theme"]
      );
      res.json({ message: "✅ Đã tạo cài đặt giao diện!", created: true });
    }
  } catch (err) {
    console.error("❌ Lỗi lưu cài đặt:", err);
    res.status(500).json({ message: "❌ Lỗi lưu cài đặt!" });
  }
});

// 📤 Export theme as JSON
router.get("/export", verifyToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await db.query(
      "SELECT primary_color, background_image, theme_name FROM user_theme_preferences WHERE user_id = $1",
      [user_id]
    );

    const themeData = result.length > 0 ? result[0] : {
      primary_color: "#ff7f50",
      background_image: "",
      theme_name: "Default"
    };

    res.json(themeData);
  } catch (err) {
    console.error("❌ Lỗi xuất giao diện:", err);
    res.status(500).json({ message: "❌ Lỗi xuất giao diện!" });
  }
});

// 📤 Chia sẻ theme (public)
router.post("/share", verifyToken, async (req, res) => {
  const user_id = req.user.id;
  const { theme_name } = req.body;

  if (!theme_name) {
    return res.status(400).json({ message: "❌ Vui lòng cung cấp tên theme!" });
  }

  try {
    await db.query(
      "UPDATE user_theme_preferences SET is_shared = TRUE, theme_name = $1 WHERE user_id = $2",
      [theme_name, user_id]
    );
    res.json({ message: "✅ Đã chia sẻ giao diện! Mọi người có thể tải theme của bạn" });
  } catch (err) {
    console.error("❌ Lỗi chia sẻ giao diện:", err);
    res.status(500).json({ message: "❌ Lỗi chia sẻ giao diện!" });
  }
});

// 🌐 Lấy danh sách theme được chia sẻ (public)
router.get("/marketplace", verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        utp.id,
        utp.primary_color,
        utp.background_image,
        utp.theme_name,
        utp.created_at,
        u.username as created_by,
        u.id as owner_id
      FROM user_theme_preferences utp
      JOIN nguoi_dung u ON utp.user_id = u.id
      WHERE utp.is_shared = TRUE
      ORDER BY utp.created_at DESC
      LIMIT 50`
    );
    res.json(result || []);
  } catch (err) {
    console.error('Lỗi lấy marketplace:', err);
    res.status(500).json({ message: "❌ Lỗi tải danh sách theme!" });
  }
});

// 🗑️ Xóa theme đã chia sẻ (chỉ chủ sở hữu hoặc admin)
router.delete("/share/:id", verifyToken, async (req, res) => {
  const themeId = req.params.id;
  const userId = req.user.id;

  try {
    const rows = await db.query(
      "SELECT user_id FROM user_theme_preferences WHERE id = $1 AND is_shared = TRUE",
      [themeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "❌ Không tìm thấy theme đã chia sẻ!" });
    }

    const themeOwnerId = rows[0].user_id;

    const userRows = await db.query("SELECT role FROM nguoi_dung WHERE id = $1", [userId]);
    const userRole = userRows[0]?.role;
    const isAdmin = userRole === 'admin' || userRole === 'ADMIN' || userRole === 'Admin';
    const isOwner = userId === themeOwnerId;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "❌ Bạn không có quyền xóa theme này!" });
    }

    await db.query("UPDATE user_theme_preferences SET is_shared = FALSE WHERE id = $1", [themeId]);
    res.json({ message: "✅ Đã hủy chia sẻ theme!" });
  } catch (err) {
    console.error("❌ Lỗi xóa chia sẻ theme:", err);
    res.status(500).json({ message: "❌ Lỗi xóa chia sẻ theme!" });
  }
});

module.exports = router;
