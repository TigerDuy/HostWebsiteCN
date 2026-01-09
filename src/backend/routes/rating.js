const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const db = require("../config/db");

// ✅ Kiểm tra user đã đánh giá chưa - MUST BE FIRST
router.get("/user/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "SELECT rating FROM danh_gia WHERE recipe_id = $1 AND user_id = $2",
      [recipeId, userId]
    );
    res.json({
      hasRated: result.rows && result.rows.length > 0,
      rating: result.rows && result.rows.length > 0 ? result.rows[0].rating : 0
    });
  } catch (err) {
    console.error("❌ PostgreSQL Error:", err.message);
    res.status(500).json({ message: "❌ Lỗi!" });
  }
});

// ✅ Lấy thống kê đánh giá (trung bình sao, tổng số đánh giá) - MUST BE SECOND
router.get("/stats/:id", async (req, res) => {
  const recipeId = req.params.id;

  try {
    const result = await db.query(
      `SELECT 
        COALESCE(AVG(rating), 0) as averagerating,
        COUNT(*) as totalratings,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as stars5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as stars4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as stars3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as stars2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as stars1
       FROM danh_gia 
       WHERE recipe_id = $1`,
      [recipeId]
    );
    const row = result.rows[0] || {};
    res.json({
      averageRating: parseFloat(row.averagerating) || 0,
      totalRatings: parseInt(row.totalratings) || 0,
      stars5: parseInt(row.stars5) || 0,
      stars4: parseInt(row.stars4) || 0,
      stars3: parseInt(row.stars3) || 0,
      stars2: parseInt(row.stars2) || 0,
      stars1: parseInt(row.stars1) || 0
    });
  } catch (err) {
    console.error("❌ PostgreSQL Error:", err.message);
    res.status(500).json({ message: "❌ Lỗi lấy thống kê!" });
  }
});

// ✅ Thêm đánh giá
router.post("/:id", verifyToken, async (req, res) => {
  const { rating } = req.body;
  const recipeId = req.params.id;
  const userId = req.user.id;

  // Validate rating (1-5)
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "❌ Đánh giá phải từ 1 đến 5 sao!" });
  }

  try {
    // Kiểm tra user đã đánh giá chưa
    const check = await db.query(
      "SELECT * FROM danh_gia WHERE recipe_id = $1 AND user_id = $2",
      [recipeId, userId]
    );

    if (check.rows && check.rows.length > 0) {
      // Cập nhật đánh giá cũ
      await db.query(
        "UPDATE danh_gia SET rating = $1 WHERE recipe_id = $2 AND user_id = $3",
        [rating, recipeId, userId]
      );
      res.json({ message: "✅ Cập nhật đánh giá thành công!" });
    } else {
      // Thêm đánh giá mới
      await db.query(
        "INSERT INTO danh_gia (recipe_id, user_id, rating, created_at) VALUES ($1, $2, $3, NOW())",
        [recipeId, userId, rating]
      );
      res.json({ message: "✅ Cảm ơn đánh giá của bạn!" });
    }
  } catch (err) {
    console.error("❌ PostgreSQL Error:", err.message);
    res.status(500).json({ message: "❌ Lỗi đánh giá!" });
  }
});

// ✅ Lấy danh sách đánh giá của công thức - MUST BE LAST
router.get("/:id", async (req, res) => {
  const recipeId = req.params.id;

  try {
    const result = await db.query(
      `SELECT danh_gia.*, nguoi_dung.username 
       FROM danh_gia 
       JOIN nguoi_dung ON danh_gia.user_id = nguoi_dung.id
       WHERE recipe_id = $1
       ORDER BY danh_gia.created_at DESC`,
      [recipeId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ PostgreSQL Error:", err.message);
    res.status(500).json({ message: "❌ Lỗi lấy đánh giá!" });
  }
});

module.exports = router;
