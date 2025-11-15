const express = require("express");
const db = require("../config/db");
const { verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// ✅ Lấy toàn bộ recipe
router.get("/recipes", verifyAdmin(db), (req, res) => {
  db.query(
    `SELECT cong_thuc.*, nguoi_dung.username
    FROM cong_thuc
    JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id
    ORDER BY cong_thuc.created_at DESC`,
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi lấy công thức!" });
      }
      res.json(result);
    }
  );
});

// ✅ Lấy danh sách người dùng
router.get("/users", verifyAdmin(db), (req, res) => {
  db.query(
    "SELECT id, username, email, role FROM nguoi_dung ORDER BY id DESC",
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi lấy danh sách người dùng!" });
      }
      res.json(result);
    }
  );
});

// ✅ Admin xóa recipe
router.delete("/delete/:id", verifyAdmin(db), (req, res) => {
  const recipeId = req.params.id;

  db.query(
    "DELETE FROM cong_thuc WHERE id = ?",
    [recipeId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi xóa công thức!" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy công thức!" });
      }

      res.json({ message: "✅ Admin đã xóa công thức!" });
    }
  );
});

// ✅ Admin xóa người dùng
router.delete("/user/:id", verifyAdmin(db), (req, res) => {
  const userId = req.params.id;

  // Không cho phép xóa chính admin này
  if (userId == req.user.id) {
    return res.status(403).json({ message: "❌ Không thể xóa chính mình!" });
  }

  db.query(
    "DELETE FROM nguoi_dung WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi xóa người dùng!" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy người dùng!" });
      }

      res.json({ message: "✅ Admin đã xóa người dùng!" });
    }
  );
});

module.exports = router;
