const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const db = require("../config/db");

// ✅ Thêm công thức vào yêu thích
router.post("/:id", verifyToken, (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  db.query(
    "INSERT INTO favorite (user_id, recipe_id) VALUES (?, ?)",
    [userId, recipeId],
    (err) => {
      if (err) {
        return res.status(400).json({ message: "❌ Công thức đã được lưu trước đó!" });
      }
      res.json({ message: "✅ Đã thêm vào yêu thích!" });
    }
  );
});

// ✅ Hủy yêu thích
router.delete("/:id", verifyToken, (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  db.query(
    "DELETE FROM favorite WHERE user_id = ? AND recipe_id = ?",
    [userId, recipeId],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi khi hủy yêu thích!" });
      }
      res.json({ message: "✅ Đã hủy yêu thích!" });
    }
  );
});

// ✅ Lấy danh sách yêu thích của user
router.get("/list", verifyToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT cong_thuc.*, nguoi_dung.username 
     FROM cong_thuc 
     JOIN favorite ON cong_thuc.id = favorite.recipe_id
     JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id
     WHERE favorite.user_id = ? 
     ORDER BY favorite.id DESC`,
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi khi lấy danh sách yêu thích!" });
      }
      res.json(result);
    }
  );
});

// ✅ Kiểm tra công thức có trong yêu thích không
router.get("/check/:id", verifyToken, (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  db.query(
    "SELECT * FROM favorite WHERE user_id = ? AND recipe_id = ?",
    [userId, recipeId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi!" });
      }
      res.json({ isFavorited: result.length > 0 });
    }
  );
});

module.exports = router;
