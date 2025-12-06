const express = require("express");
const db = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const router = express.Router();

// ✅ API lấy danh sách công thức (Admin)
router.get("/recipes", verifyAdmin(db), (req, res) => {
  db.query(
    `SELECT 
      cong_thuc.*,
      nguoi_dung.username,
      nguoi_dung.avatar_url,
      COALESCE(AVG(danh_gia.rating), 0) as avg_rating,
      COUNT(DISTINCT danh_gia.id) as rating_count,
      COUNT(DISTINCT favorite.id) as favorite_count
    FROM cong_thuc 
    JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id
    LEFT JOIN danh_gia ON cong_thuc.id = danh_gia.recipe_id
    LEFT JOIN favorite ON cong_thuc.id = favorite.recipe_id
    GROUP BY cong_thuc.id
    ORDER BY cong_thuc.created_at DESC`,
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi lấy danh sách công thức!" });
      res.json(result);
    }
  );
});

// ✅ API lấy danh sách người dùng (Admin)
router.get("/users", verifyAdmin(db), (req, res) => {
  db.query(
    "SELECT id, username, email, role, created_at, avatar_url FROM nguoi_dung ORDER BY created_at DESC",
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi lấy danh sách người dùng!" });
      res.json(result);
    }
  );
});

// ✅ API xóa công thức (Admin)
router.delete("/delete/:id", verifyAdmin(db), (req, res) => {
  const recipeId = req.params.id;

  db.query(
    "DELETE FROM cong_thuc WHERE id = ?",
    [recipeId],
    (err) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi xóa công thức!" });
      res.json({ message: "✅ Xóa công thức thành công!" });
    }
  );
});

// ✅ API xóa người dùng (Admin)
router.delete("/user/:id", verifyAdmin(db), (req, res) => {
  const userId = req.params.id;

  db.query(
    "DELETE FROM nguoi_dung WHERE id = ?",
    [userId],
    (err) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi xóa người dùng!" });
      res.json({ message: "✅ Xóa người dùng thành công!" });
    }
  );
});

module.exports = router;
