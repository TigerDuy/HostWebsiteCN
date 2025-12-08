const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

// Helper: check whether cloudinary is configured with real credentials
function isCloudinaryConfigured() {
  try {
    const cfg = cloudinary.config();
    const cloud_name = cfg.cloud_name || cfg.cloud_name;
    const api_key = cfg.api_key || cfg.api_key;
    const api_secret = cfg.api_secret || cfg.api_secret;

    const placeholders = ["YOUR_CLOUD_NAME", "YOUR_API_KEY", "YOUR_API_SECRET"];
    if (!cloud_name || !api_key || !api_secret) return false;
    if (placeholders.includes(cloud_name) || placeholders.includes(api_key) || placeholders.includes(api_secret)) return false;
    return true;
  } catch (e) {
    return false;
  }
}

// ✅ API tạo công thức
router.post("/create", verifyToken, upload.single("image"), async (req, res) => {
  try {
    console.log('DEBUG /recipe/create req.body =', req.body);
    console.log('DEBUG /recipe/create req.file =', req.file);
    try {
      const debugPath = require('path').join(__dirname, '..', 'logs');
      const fs = require('fs');
      if (!fs.existsSync(debugPath)) fs.mkdirSync(debugPath);
      fs.appendFileSync(require('path').join(debugPath, 'create_debug.log'), JSON.stringify({ time: new Date().toISOString(), body: req.body, file: !!req.file }) + "\n");
    } catch (e) {
      // ignore
    }
    const { title, ingredients, steps } = req.body;
    const user_id = req.user.id;

    // Validate
    if (!title || !ingredients || !steps) {
      return res.status(400).json({ message: "❌ Vui lòng điền đầy đủ thông tin!" });
    }

    let imageUrl = null;

    // ✅ Upload media (image or video) if provided. If Cloudinary configured use remote upload; otherwise fallback to local storage
    if (req.file) {
      const isVideo = (req.file.mimetype || "").startsWith("video/");
      if (isCloudinaryConfigured()) {
        try {
          // For videos, tell Cloudinary resource_type: 'video'
          const uploadOptions = isVideo ? { resource_type: 'video' } : { resource_type: 'image' };
          const uploadImg = await cloudinary.uploader.upload(req.file.path, uploadOptions);
          imageUrl = uploadImg.secure_url;
          // Remove local temp file after upload
          fs.unlink(req.file.path, () => {});
        } catch (uploadErr) {
          console.warn("⚠️  Cloudinary upload failed, attempt local fallback:", uploadErr.message);
          // try local fallback
          try {
            const ext = path.extname(req.file.originalname) || "";
            const newName = req.file.filename + ext;
            const target = path.join(__dirname, "..", "uploads", newName);
            fs.renameSync(req.file.path, target);
            imageUrl = `http://localhost:3001/uploads/${newName}`;
          } catch (localErr) {
            console.warn("⚠️  Local fallback failed:", localErr.message);
            imageUrl = null;
            // try to remove temp if exists
            try { fs.unlinkSync(req.file.path); } catch(e){}
          }
        }
      } else {
        // Cloudinary not configured -> local fallback
        try {
          const ext = path.extname(req.file.originalname) || "";
          const newName = req.file.filename + ext;
          const target = path.join(__dirname, "..", "uploads", newName);
          fs.renameSync(req.file.path, target);
          imageUrl = `http://localhost:3001/uploads/${newName}`;
        } catch (localErr) {
          console.warn("⚠️  Local fallback failed:", localErr.message);
          imageUrl = null;
          try { fs.unlinkSync(req.file.path); } catch(e){}
        }
      }
    }

    db.query(
      "INSERT INTO cong_thuc (user_id, title, ingredients, steps, image_url, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [user_id, title, ingredients, steps, imageUrl],
      (err) => {
        if (err) {
          return res.status(500).json({ message: "❌ Lỗi tạo công thức!" });
        }
        res.json({ message: "✅ Tạo công thức thành công!" });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// ✅ API lấy danh sách công thức (với stats)
router.get("/list", (req, res) => {
  db.query(`
    SELECT 
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
    ORDER BY avg_rating DESC, cong_thuc.created_at DESC
  `, (err, result) => {
    if (err) return res.status(500).json({ message: "❌ Lỗi khi lấy danh sách công thức!" });
    res.json(result);
  });
});

// ✅ API tìm kiếm công thức (với stats)
router.get("/search", (req, res) => {
  const q = req.query.q || "";
  
  db.query(`
    SELECT 
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
    WHERE cong_thuc.title LIKE ?
    GROUP BY cong_thuc.id
    ORDER BY avg_rating DESC, cong_thuc.created_at DESC
  `, [`%${q}%`], (err, result) => {
    if (err) return res.status(500).json({ message: "❌ Lỗi tìm kiếm!" });
    res.json(result);
  });
});

// ✅ API xem chi tiết công thức theo ID (với stats)
router.get("/detail/:id", (req, res) => {
  const recipeId = req.params.id;

  db.query(`
    SELECT 
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
    WHERE cong_thuc.id = ?
    GROUP BY cong_thuc.id
  `, [recipeId], (err, result) => {
    if (err || result.length === 0)
      return res.status(404).json({ message: "❌ Không tìm thấy công thức!" });
    res.json(result[0]);
  });
});

// ✅ API thêm bình luận
router.post("/comment", verifyToken, (req, res) => {
  const { recipe_id, comment } = req.body;
  const user_id = req.user.id;

  if (!comment || !recipe_id) {
    return res.status(400).json({ message: "❌ Bình luận không được để trống!" });
  }

  db.query(
    "INSERT INTO binh_luan (recipe_id, user_id, comment, created_at) VALUES (?, ?, ?, NOW())",
    [recipe_id, user_id, comment],
    (err) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi khi thêm bình luận!" });
      res.json({ message: "✅ Đã gửi bình luận!" });
    }
  );
});

// ✅ API lấy danh sách bình luận
router.get("/comment/:id", (req, res) => {
  const recipeId = req.params.id;

  db.query(
    `SELECT binh_luan.*, nguoi_dung.username, nguoi_dung.avatar_url
     FROM binh_luan 
     JOIN nguoi_dung ON binh_luan.user_id = nguoi_dung.id
     WHERE recipe_id = ?
     ORDER BY binh_luan.created_at DESC`,
    [recipeId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi khi lấy bình luận!" });
      res.json(result);
    }
  );
});

// ✅ API cập nhật bình luận
router.put("/comment/:id", verifyToken, (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;
  const { comment } = req.body;

  if (!comment || comment.trim() === "") {
    return res.status(400).json({ message: "❌ Bình luận không được để trống!" });
  }

  // Kiểm tra bình luận có thuộc user không
  db.query(
    "SELECT user_id FROM binh_luan WHERE id = ?",
    [commentId],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(400).json({ message: "❌ Bình luận không tồn tại!" });
      }

      if (result[0].user_id !== userId) {
        return res.status(403).json({ message: "❌ Bạn không có quyền chỉnh sửa bình luận này!" });
      }

      // Cập nhật bình luận
      db.query(
        "UPDATE binh_luan SET comment = ? WHERE id = ?",
        [comment, commentId],
        (err) => {
          if (err) return res.status(500).json({ message: "❌ Lỗi khi cập nhật bình luận!" });
          res.json({ message: "✅ Đã cập nhật bình luận!" });
        }
      );
    }
  );
});

// ✅ API xóa bình luận
router.delete("/comment/:id", verifyToken, (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  // Kiểm tra bình luận có thuộc user không
  db.query(
    "SELECT user_id FROM binh_luan WHERE id = ?",
    [commentId],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(400).json({ message: "❌ Bình luận không tồn tại!" });
      }

      if (result[0].user_id !== userId) {
        return res.status(403).json({ message: "❌ Bạn không có quyền xóa bình luận này!" });
      }

      // Xóa bình luận
      db.query(
        "DELETE FROM binh_luan WHERE id = ?",
        [commentId],
        (err) => {
          if (err) return res.status(500).json({ message: "❌ Lỗi khi xóa bình luận!" });
          res.json({ message: "✅ Đã xóa bình luận!" });
        }
      );
    }
  );
});

// ✅ API lấy danh sách công thức của user đang đăng nhập (với stats)
router.get("/my", verifyToken, (req, res) => {
  const user_id = req.user.id;

  db.query(`
    SELECT 
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
    WHERE cong_thuc.user_id = ?
    GROUP BY cong_thuc.id
    ORDER BY cong_thuc.created_at DESC
  `, [user_id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "❌ Lỗi khi lấy công thức của tôi!" });
    res.json(result);
  });
});

// ✅ API lấy công thức theo user ID (pagination + stats)
router.get("/author/:userId", (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;

  db.query(
    "SELECT COUNT(*) as total FROM cong_thuc WHERE user_id = ?",
    [userId],
    (err, countResult) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi đếm công thức!" });

      const total = countResult[0].total;

      db.query(`
        SELECT 
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
        WHERE cong_thuc.user_id = ?
        GROUP BY cong_thuc.id
        ORDER BY cong_thuc.created_at DESC 
        LIMIT ? OFFSET ?
      `, [userId, limit, offset], (err, result) => {
        if (err) return res.status(500).json({ message: "❌ Lỗi lấy công thức!" });
        res.json({ data: result, page, limit, total });
      });
    }
  );
});

// ✅ API cập nhật công thức
router.put("/update/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { title, ingredients, steps } = req.body;
    const user_id = req.user.id;

    if (!title || !ingredients || !steps) {
      return res.status(400).json({ message: "❌ Vui lòng điền đầy đủ thông tin!" });
    }

    // Nếu có ảnh mới, upload lên Cloudinary
    let updateData = [title, ingredients, steps, recipeId, user_id];
    let updateQuery = "UPDATE cong_thuc SET title=?, ingredients=?, steps=? WHERE id=? AND user_id=?";

    if (req.file) {
      let newImageUrl = null;
      if (isCloudinaryConfigured()) {
        try {
          const uploadImg = await cloudinary.uploader.upload(req.file.path);
          newImageUrl = uploadImg.secure_url;
          fs.unlink(req.file.path, () => {});
        } catch (uploadErr) {
          console.warn("⚠️  Cloudinary upload failed on update, attempt local fallback:", uploadErr.message);
        }
      }

      if (!newImageUrl) {
        // local fallback
        try {
          const ext = path.extname(req.file.originalname) || "";
          const newName = req.file.filename + ext;
          const target = path.join(__dirname, "..", "uploads", newName);
          fs.renameSync(req.file.path, target);
          newImageUrl = `http://localhost:3001/uploads/${newName}`;
        } catch (localErr) {
          console.warn("⚠️  Local fallback failed on update:", localErr.message);
          try { fs.unlinkSync(req.file.path); } catch(e){}
        }
      }

      if (newImageUrl) {
        updateData = [title, ingredients, steps, newImageUrl, recipeId, user_id];
        updateQuery = "UPDATE cong_thuc SET title=?, ingredients=?, steps=?, image_url=? WHERE id=? AND user_id=?";
      }
    }

    db.query(updateQuery, updateData, (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi cập nhật công thức!" });

      if (result.affectedRows === 0) {
        return res.status(403).json({ message: "❌ Bạn không có quyền cập nhật công thức này!" });
      }

      res.json({ message: "✅ Cập nhật thành công!" });
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// ✅ API xóa công thức
router.delete("/delete/:id", verifyToken, (req, res) => {
  const recipeId = req.params.id;
  const user_id = req.user.id;

  db.query(
    "DELETE FROM cong_thuc WHERE id = ? AND user_id = ?",
    [recipeId, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi khi xóa công thức!" });

      if (result.affectedRows === 0)
        return res.status(403).json({ message: "❌ Bạn không có quyền xóa công thức này!" });

      res.json({ message: "✅ Xóa công thức thành công!" });
    }
  );
});

// ✅ API view counter
router.post("/view/:id", (req, res) => {
  const recipeId = req.params.id;
  db.query(
    "UPDATE cong_thuc SET views = views + 1 WHERE id = ?",
    [recipeId],
    (err) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi cập nhật view!" });
      res.json({ message: "✅ View count updated" });
    }
  );
});

module.exports = router;
