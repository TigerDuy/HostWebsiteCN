const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const db = require("../config/db");

// ✅ Thêm công thức vào yêu thích
router.post("/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  try {
    await db.query(
      "INSERT INTO favorite (user_id, recipe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, recipeId]
    );
    res.json({ message: "✅ Đã thêm vào yêu thích!" });
  } catch (err) {
    console.error("❌ PostgreSQL Error:", err.message);
    res.status(400).json({ message: "❌ Công thức đã được lưu trước đó!" });
  }
});

// ✅ Hủy yêu thích
router.delete("/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  try {
    await db.query(
      "DELETE FROM favorite WHERE user_id = $1 AND recipe_id = $2",
      [userId, recipeId]
    );
    res.json({ message: "✅ Đã hủy yêu thích!" });
  } catch (err) {
    console.error("❌ PostgreSQL Error:", err.message);
    res.status(500).json({ message: "❌ Lỗi khi hủy yêu thích!" });
  }
});

// ✅ Lấy danh sách yêu thích của user
router.get("/list", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT cong_thuc.*, 
              nguoi_dung.username, 
              nguoi_dung.avatar_url,
              COALESCE(AVG(danh_gia.rating), 0) as avg_rating,
              COUNT(DISTINCT danh_gia.id) as rating_count,
              COUNT(DISTINCT fav.id) as favorite_count
       FROM cong_thuc 
       JOIN favorite ON cong_thuc.id = favorite.recipe_id
       JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id
       LEFT JOIN danh_gia ON cong_thuc.id = danh_gia.recipe_id
       LEFT JOIN favorite fav ON cong_thuc.id = fav.recipe_id
       WHERE favorite.user_id = $1 
       GROUP BY cong_thuc.id, nguoi_dung.id, nguoi_dung.username, nguoi_dung.avatar_url, favorite.id
       ORDER BY favorite.id DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ PostgreSQL Error:", err.message);
    res.status(500).json({ message: "❌ Lỗi khi lấy danh sách yêu thích!" });
  }
});

// ✅ Kiểm tra công thức có trong yêu thích không
router.get("/check/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "SELECT * FROM favorite WHERE user_id = $1 AND recipe_id = $2",
      [userId, recipeId]
    );
    res.json({ isFavorited: result.rows.length > 0 });
  } catch (err) {
    console.error("❌ PostgreSQL Error:", err.message);
    res.status(500).json({ message: "❌ Lỗi!" });
  }
});

module.exports = router;
