const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const db = require("../config/db");

// ✅ Theo dõi người dùng
router.post("/:userId", verifyToken, async (req, res) => {
  const followingId = req.params.userId;
  const followerId = req.user.id;

  if (parseInt(followingId) === followerId) {
    return res.status(400).json({ message: "❌ Không thể theo dõi chính mình!" });
  }

  try {
    await db.query(
      "INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [followerId, followingId]
    );
    res.json({ message: "✅ Đã theo dõi!" });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "⚠️ Bạn đã theo dõi người dùng này!" });
    }
    console.error("❌ Lỗi khi theo dõi:", err);
    res.status(500).json({ message: "❌ Lỗi khi theo dõi!" });
  }
});

// ✅ Hủy theo dõi
router.delete("/:userId", verifyToken, async (req, res) => {
  const followingId = req.params.userId;
  const followerId = req.user.id;

  try {
    await db.query(
      "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2",
      [followerId, followingId]
    );
    res.json({ message: "✅ Đã hủy theo dõi!" });
  } catch (err) {
    console.error("❌ Lỗi khi hủy theo dõi:", err);
    res.status(500).json({ message: "❌ Lỗi khi hủy theo dõi!" });
  }
});

// ✅ Kiểm tra đã theo dõi chưa
router.get("/is-following/:userId", verifyToken, async (req, res) => {
  const followingId = req.params.userId;
  const followerId = req.user.id;

  try {
    const result = await db.query(
      "SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2",
      [followerId, followingId]
    );
    res.json({ isFollowing: result.length > 0 });
  } catch (err) {
    console.error("❌ Lỗi:", err);
    res.status(500).json({ message: "❌ Lỗi!" });
  }
});

// ✅ Lấy số lượng followers và following
router.get("/counts/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM follows WHERE following_id = $1) as followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following`,
      [userId]
    );
    res.json({
      followers: result[0]?.followers || 0,
      following: result[0]?.following || 0
    });
  } catch (err) {
    console.error("❌ Lỗi:", err);
    res.status(500).json({ message: "❌ Lỗi!" });
  }
});

// ✅ Lấy danh sách followers
router.get("/followers/:userId", async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const result = await db.query(
      `SELECT n.id, n.username, n.avatar_url, n.bio
       FROM nguoi_dung n
       JOIN follows f ON n.id = f.follower_id
       WHERE f.following_id = $1
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM follows WHERE following_id = $1",
      [userId]
    );

    res.json({
      data: result,
      total: countResult[0]?.total || 0,
      page,
      limit
    });
  } catch (err) {
    console.error("❌ Lỗi:", err);
    res.status(500).json({ message: "❌ Lỗi!" });
  }
});

// ✅ Lấy danh sách following
router.get("/following/:userId", async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const result = await db.query(
      `SELECT n.id, n.username, n.avatar_url, n.bio
       FROM nguoi_dung n
       JOIN follows f ON n.id = f.following_id
       WHERE f.follower_id = $1
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM follows WHERE follower_id = $1",
      [userId]
    );

    res.json({
      data: result,
      total: countResult[0]?.total || 0,
      page,
      limit
    });
  } catch (err) {
    console.error("❌ Lỗi:", err);
    res.status(500).json({ message: "❌ Lỗi!" });
  }
});

module.exports = router;
