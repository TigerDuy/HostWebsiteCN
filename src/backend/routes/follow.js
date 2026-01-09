const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const db = require("../config/db");

// ✅ Theo dõi người dùng
router.post("/:userId", verifyToken, (req, res) => {
  const followingId = req.params.userId;
  const followerId = req.user.id;

  if (parseInt(followingId) === followerId) {
    return res.status(400).json({ message: "❌ Không thể theo dõi chính mình!" });
  }

  db.query(
    "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
    [followerId, followingId],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "⚠️ Bạn đã theo dõi người dùng này!" });
        }
        return res.status(500).json({ message: "❌ Lỗi khi theo dõi!" });
      }
      res.json({ message: "✅ Đã theo dõi!" });
    }
  );
});

// ✅ Hủy theo dõi
router.delete("/:userId", verifyToken, (req, res) => {
  const followingId = req.params.userId;
  const followerId = req.user.id;

  db.query(
    "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
    [followerId, followingId],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi khi hủy theo dõi!" });
      }
      res.json({ message: "✅ Đã hủy theo dõi!" });
    }
  );
});

// ✅ Kiểm tra đã theo dõi chưa
router.get("/is-following/:userId", verifyToken, (req, res) => {
  const followingId = req.params.userId;
  const followerId = req.user.id;

  db.query(
    "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?",
    [followerId, followingId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi!" });
      }
      res.json({ isFollowing: result.length > 0 });
    }
  );
});

// ✅ Lấy số lượng followers và following
router.get("/counts/:userId", (req, res) => {
  const userId = req.params.userId;

  db.query(
    `SELECT 
      (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followers,
      (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following`,
    [userId, userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi!" });
      }
      res.json({
        followers: result[0]?.followers || 0,
        following: result[0]?.following || 0
      });
    }
  );
});

// ✅ Lấy danh sách followers
router.get("/followers/:userId", (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.query(
    `SELECT n.id, n.username, n.avatar_url, n.bio
     FROM nguoi_dung n
     JOIN follows f ON n.id = f.follower_id
     WHERE f.following_id = ?
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi!" });
      }

      db.query(
        "SELECT COUNT(*) as total FROM follows WHERE following_id = ?",
        [userId],
        (err2, countResult) => {
          res.json({
            data: result,
            total: countResult[0]?.total || 0,
            page,
            limit
          });
        }
      );
    }
  );
});

// ✅ Lấy danh sách following
router.get("/following/:userId", (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.query(
    `SELECT n.id, n.username, n.avatar_url, n.bio
     FROM nguoi_dung n
     JOIN follows f ON n.id = f.following_id
     WHERE f.follower_id = ?
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi!" });
      }

      db.query(
        "SELECT COUNT(*) as total FROM follows WHERE follower_id = ?",
        [userId],
        (err2, countResult) => {
          res.json({
            data: result,
            total: countResult[0]?.total || 0,
            page,
            limit
          });
        }
      );
    }
  );
});

module.exports = router;
