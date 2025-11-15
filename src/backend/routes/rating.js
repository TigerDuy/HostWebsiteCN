const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const db = require("../config/db");

// ✅ Kiểm tra user đã đánh giá chưa - MUST BE FIRST
router.get("/user/:id", verifyToken, (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  db.query(
    "SELECT rating FROM danh_gia WHERE recipe_id = ? AND user_id = ?",
    [recipeId, userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi!" });
      }
      res.json({
        hasRated: result && result.length > 0,
        rating: result && result.length > 0 ? result[0].rating : 0
      });
    }
  );
});

// ✅ Lấy thống kê đánh giá (trung bình sao, tổng số đánh giá) - MUST BE SECOND
router.get("/stats/:id", (req, res) => {
  const recipeId = req.params.id;

  db.query(
    `SELECT 
      COALESCE(AVG(rating), 0) as averageRating,
      COUNT(*) as totalRatings,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as stars5,
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as stars4,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as stars3,
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as stars2,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as stars1
     FROM danh_gia 
     WHERE recipe_id = ?`,
    [recipeId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi lấy thống kê!" });
      }
      res.json(result[0] || {
        averageRating: 0,
        totalRatings: 0,
        stars5: 0,
        stars4: 0,
        stars3: 0,
        stars2: 0,
        stars1: 0
      });
    }
  );
});

// ✅ Thêm đánh giá
router.post("/:id", verifyToken, (req, res) => {
  const { rating } = req.body;
  const recipeId = req.params.id;
  const userId = req.user.id;

  // Validate rating (1-5)
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "❌ Đánh giá phải từ 1 đến 5 sao!" });
  }

  // Kiểm tra user đã đánh giá chưa
  db.query(
    "SELECT * FROM danh_gia WHERE recipe_id = ? AND user_id = ?",
    [recipeId, userId],
    (err, result) => {
      if (result && result.length > 0) {
        // Cập nhật đánh giá cũ
        db.query(
          "UPDATE danh_gia SET rating = ? WHERE recipe_id = ? AND user_id = ?",
          [rating, recipeId, userId],
          (err) => {
            if (err) {
              return res.status(500).json({ message: "❌ Lỗi cập nhật đánh giá!" });
            }
            res.json({ message: "✅ Cập nhật đánh giá thành công!" });
          }
        );
      } else {
        // Thêm đánh giá mới
        db.query(
          "INSERT INTO danh_gia (recipe_id, user_id, rating, created_at) VALUES (?, ?, ?, NOW())",
          [recipeId, userId, rating],
          (err) => {
            if (err) {
              return res.status(500).json({ message: "❌ Lỗi thêm đánh giá!" });
            }
            res.json({ message: "✅ Cảm ơn đánh giá của bạn!" });
          }
        );
      }
    }
  );
});

// ✅ Lấy danh sách đánh giá của công thức - MUST BE LAST
router.get("/:id", (req, res) => {
  const recipeId = req.params.id;

  db.query(
    `SELECT danh_gia.*, nguoi_dung.username 
     FROM danh_gia 
     JOIN nguoi_dung ON danh_gia.user_id = nguoi_dung.id
     WHERE recipe_id = ?
     ORDER BY danh_gia.created_at DESC`,
    [recipeId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi lấy đánh giá!" });
      }
      res.json(result);
    }
  );
});

module.exports = router;
