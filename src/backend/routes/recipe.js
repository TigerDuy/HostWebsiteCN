const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const upload = multer({ dest: "uploads/" });
const uploadMultiple = multer({ dest: "uploads/" });

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

    const category = req.body.category || 'other';
    const cuisine = req.body.cuisine || 'other';
    const tagIds = req.body.tags ? JSON.parse(req.body.tags) : [];

    db.query(
      "INSERT INTO cong_thuc (user_id, title, ingredients, steps, image_url, servings, cook_time, category, cuisine, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [user_id, title, ingredients, steps, imageUrl, req.body.servings || "0", req.body.cook_time || "0", category, cuisine],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "❌ Lỗi tạo công thức!" });
        }
        
        const recipeId = result.insertId;
        
        // Add tags if provided
        if (tagIds.length > 0) {
          const tagValues = tagIds.map(tagId => [recipeId, tagId]);
          db.query(
            "INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ?",
            [tagValues],
            (tagErr) => {
              if (tagErr) console.warn("⚠️ Lỗi thêm tags:", tagErr.message);
              // Update usage count
              db.query("UPDATE tags SET usage_count = (SELECT COUNT(*) FROM recipe_tags WHERE tag_id = tags.id)");
            }
          );
        }
        
        res.json({ 
          message: "✅ Tạo công thức thành công!",
          id: recipeId 
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// ✅ API lấy danh sách công thức (với stats, filter, pagination)
router.get("/list", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  const category = req.query.category || null;
  const cuisine = req.query.cuisine || null;
  const tag = req.query.tag || null;

  // Build WHERE conditions
  let conditions = ["cong_thuc.is_hidden = FALSE"];
  let params = [];

  if (category) {
    conditions.push("cong_thuc.category = ?");
    params.push(category);
  }
  if (cuisine) {
    conditions.push("cong_thuc.cuisine = ?");
    params.push(cuisine);
  }

  let joinTag = "";
  if (tag) {
    joinTag = "JOIN recipe_tags rt ON cong_thuc.id = rt.recipe_id JOIN tags t ON rt.tag_id = t.id";
    conditions.push("t.slug = ?");
    params.push(tag);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count total
  db.query(
    `SELECT COUNT(DISTINCT cong_thuc.id) as total 
     FROM cong_thuc 
     JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id
     ${joinTag}
     ${whereClause}`,
    params,
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
        ${joinTag}
        LEFT JOIN danh_gia ON cong_thuc.id = danh_gia.recipe_id
        LEFT JOIN favorite ON cong_thuc.id = favorite.recipe_id
        ${whereClause}
        GROUP BY cong_thuc.id, nguoi_dung.id, nguoi_dung.username, nguoi_dung.avatar_url
        ORDER BY rating_count DESC, avg_rating DESC, cong_thuc.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, limit, offset], (err, result) => {
        if (err) return res.status(500).json({ message: "❌ Lỗi khi lấy danh sách công thức!" });
        res.json({
          data: result,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        });
      });
    }
  );
});

// ✅ API lấy danh sách tags
router.get("/tags", (req, res) => {
  db.query(
    "SELECT * FROM tags ORDER BY usage_count DESC, name ASC",
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi lấy tags!" });
      res.json(result);
    }
  );
});

// ✅ API tạo tag mới
router.post("/tags", verifyToken, (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "❌ Tên tag phải có ít nhất 2 ký tự!" });
  }

  const slug = name.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  db.query(
    "INSERT INTO tags (name, slug) VALUES (?, ?) ON CONFLICT (slug) DO NOTHING",
    [name.trim(), slug],
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi tạo tag!" });
      
      // Get the tag (either new or existing)
      db.query("SELECT * FROM tags WHERE slug = ?", [slug], (err, tags) => {
        if (err || !tags.length) return res.status(500).json({ message: "❌ Lỗi lấy tag!" });
        res.json(tags[0]);
      });
    }
  );
});

// ✅ API lấy tags của một công thức
router.get("/tags/:recipeId", (req, res) => {
  const { recipeId } = req.params;
  db.query(
    `SELECT t.* FROM tags t 
     JOIN recipe_tags rt ON t.id = rt.tag_id 
     WHERE rt.recipe_id = ?`,
    [recipeId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi lấy tags!" });
      res.json(result);
    }
  );
});

// ✅ API cập nhật tags cho công thức
router.put("/tags/:recipeId", verifyToken, (req, res) => {
  const { recipeId } = req.params;
  const { tagIds } = req.body; // Array of tag IDs
  const userId = req.user.id;

  // Verify ownership
  db.query("SELECT user_id FROM cong_thuc WHERE id = ?", [recipeId], (err, result) => {
    if (err || !result.length) return res.status(404).json({ message: "❌ Không tìm thấy công thức!" });
    if (result[0].user_id !== userId) return res.status(403).json({ message: "❌ Không có quyền!" });

    // Delete old tags
    db.query("DELETE FROM recipe_tags WHERE recipe_id = ?", [recipeId], (err) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi xóa tags cũ!" });

      if (!tagIds || tagIds.length === 0) {
        return res.json({ message: "✅ Đã cập nhật tags!" });
      }

      // Insert new tags
      const values = tagIds.map(tagId => [recipeId, tagId]);
      db.query(
        "INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ?",
        [values],
        (err) => {
          if (err) return res.status(500).json({ message: "❌ Lỗi thêm tags!" });
          
          // Update usage count
          db.query(
            "UPDATE tags SET usage_count = (SELECT COUNT(*) FROM recipe_tags WHERE tag_id = tags.id)"
          );
          
          res.json({ message: "✅ Đã cập nhật tags!" });
        }
      );
    });
  });
});

// ✅ API lấy danh sách categories và cuisines
router.get("/filters", (req, res) => {
  const categories = [
    { value: 'main', label: 'Món chính' },
    { value: 'appetizer', label: 'Khai vị' },
    { value: 'dessert', label: 'Tráng miệng' },
    { value: 'drink', label: 'Đồ uống' },
    { value: 'soup', label: 'Canh/Súp' },
    { value: 'salad', label: 'Salad' },
    { value: 'snack', label: 'Ăn vặt' },
    { value: 'other', label: 'Khác' }
  ];

  const cuisines = [
    { value: 'vietnam', label: 'Việt Nam' },
    { value: 'korea', label: 'Hàn Quốc' },
    { value: 'japan', label: 'Nhật Bản' },
    { value: 'china', label: 'Trung Quốc' },
    { value: 'thailand', label: 'Thái Lan' },
    { value: 'italy', label: 'Ý' },
    { value: 'france', label: 'Pháp' },
    { value: 'usa', label: 'Mỹ' },
    { value: 'other', label: 'Khác' }
  ];

  res.json({ categories, cuisines });
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
    WHERE cong_thuc.title LIKE ? AND cong_thuc.is_hidden = FALSE
    GROUP BY cong_thuc.id, nguoi_dung.id, nguoi_dung.username, nguoi_dung.avatar_url
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
    GROUP BY cong_thuc.id, nguoi_dung.id, nguoi_dung.username, nguoi_dung.avatar_url
  `, [recipeId], (err, result) => {
    if (err || result.length === 0)
      return res.status(404).json({ message: "❌ Không tìm thấy công thức!" });
    
    const recipe = result[0];
    // Chặn bài ẩn trừ khi là chủ sở hữu hoặc admin
    const token = req.headers.authorization?.split(' ')[1];
    let currentUserId = null;
    let currentUserRole = null;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'SECRET_KEY');
        currentUserId = decoded.id;
        currentUserRole = decoded.role;
      } catch (e) {}
    }
    
    if (recipe.is_hidden && currentUserId !== recipe.user_id && currentUserRole !== 'admin') {
      return res.status(403).json({ message: "❌ Bài viết này đã bị ẩn do vi phạm quy định!" });
    }
    
    // Lấy ảnh từng bước
    db.query(
      "SELECT id, step_index, image_url FROM step_images WHERE recipe_id = ? ORDER BY step_index ASC, id ASC",
      [recipeId],
      (err, images) => {
        const recipe = result[0];
        if (images && images.length > 0) {
          // Group images by step_index, keep ID for deletion
          const stepImages = {};
          images.forEach(img => {
            if (!stepImages[img.step_index]) {
              stepImages[img.step_index] = [];
            }
            stepImages[img.step_index].push({
              id: img.id,
              image_url: img.image_url
            });
          });
          recipe.step_images_by_step = stepImages;
        } else {
          recipe.step_images_by_step = {};
        }
        res.json(recipe);
      }
    );
  });
});

// ✅ API thêm bình luận
router.post("/comment", verifyToken, (req, res) => {
  const { recipe_id, comment, parent_comment_id } = req.body;
  const user_id = req.user.id;

  if (!comment || !recipe_id) {
    return res.status(400).json({ message: "❌ Bình luận không được để trống!" });
  }

  db.query(
    "INSERT INTO binh_luan (recipe_id, user_id, comment, parent_comment_id, created_at) VALUES (?, ?, ?, ?, NOW())",
    [recipe_id, user_id, comment, parent_comment_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi khi thêm bình luận!" });
      res.json({ message: "✅ Đã gửi bình luận!", id: result.insertId });
    }
  );
});

// ✅ API lấy danh sách bình luận (nested)
router.get("/comment/:id", (req, res) => {
  const recipeId = req.params.id;

  db.query(
    `SELECT binh_luan.*, nguoi_dung.username, nguoi_dung.avatar_url,
     (SELECT COUNT(*) FROM comment_likes WHERE comment_id = binh_luan.id) as like_count,
     (SELECT COUNT(*) > 0 FROM comment_likes WHERE comment_id = binh_luan.id AND user_id = ?) as user_liked
     FROM binh_luan 
     JOIN nguoi_dung ON binh_luan.user_id = nguoi_dung.id
     WHERE recipe_id = ?
     ORDER BY binh_luan.created_at ASC`,
    [req.query.userId || 0, recipeId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi khi lấy bình luận!" });
      
      // Build nested structure
      const commentsMap = {};
      const rootComments = [];
      
      result.forEach(comment => {
        comment.replies = [];
        commentsMap[comment.id] = comment;
      });
      
      result.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentsMap[comment.parent_comment_id];
          if (parent) {
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });
      
      res.json(rootComments);
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

// ✅ API like/unlike comment
router.post("/comment/:id/like", verifyToken, (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  // Check if already liked
  db.query(
    "SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?",
    [commentId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi kiểm tra like!" });

      if (result.length > 0) {
        // Unlike
        db.query(
          "DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?",
          [commentId, userId],
          (err) => {
            if (err) return res.status(500).json({ message: "❌ Lỗi unlike!" });
            res.json({ liked: false });
          }
        );
      } else {
        // Like
        db.query(
          "INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)",
          [commentId, userId],
          (err) => {
            if (err) return res.status(500).json({ message: "❌ Lỗi like!" });
            res.json({ liked: true });
          }
        );
      }
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
    GROUP BY cong_thuc.id, nguoi_dung.id, nguoi_dung.username, nguoi_dung.avatar_url
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
        GROUP BY cong_thuc.id, nguoi_dung.id, nguoi_dung.username, nguoi_dung.avatar_url
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
    const category = req.body.category || 'other';
    const cuisine = req.body.cuisine || 'other';

    if (!title || !ingredients || !steps) {
      return res.status(400).json({ message: "❌ Vui lòng điền đầy đủ thông tin!" });
    }

    // Nếu có ảnh mới, upload lên Cloudinary
    let updateData = [title, ingredients, steps, req.body.servings || "0", req.body.cook_time || "0", category, cuisine, recipeId, user_id];
    let updateQuery = "UPDATE cong_thuc SET title=?, ingredients=?, steps=?, servings=?, cook_time=?, category=?, cuisine=? WHERE id=? AND user_id=?";

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
        updateData = [title, ingredients, steps, req.body.servings || "0", req.body.cook_time || "0", category, cuisine, newImageUrl, recipeId, user_id];
        updateQuery = "UPDATE cong_thuc SET title=?, ingredients=?, steps=?, servings=?, cook_time=?, category=?, cuisine=?, image_url=? WHERE id=? AND user_id=?";
      }
    }

    console.log("Update recipe input", {
      recipeId,
      user_id,
      body: req.body,
      hasFile: !!req.file,
      file: req.file ? { originalname: req.file.originalname, path: req.file.path, mimetype: req.file.mimetype, size: req.file.size } : null,
    });
    console.log("Update recipe query", { updateQuery, updateData });
    db.query(updateQuery, updateData, (err, result) => {
      if (err) {
        console.error("Update recipe error", err);
        return res.status(500).json({ message: "❌ Lỗi cập nhật công thức!", detail: err.message, sql: err.sqlMessage, sqlState: err.sqlState });
      }

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

// ✅ API view counter (chặn spam: 1 view/user/recipe/1 phút)
router.post("/view/:id", (req, res) => {
  const recipeId = req.params.id;
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  
  // Kiểm tra xem IP này đã xem trong 1 phút chưa
  db.query(
    `SELECT id FROM recipe_views 
     WHERE recipe_id = ? AND client_ip = ? AND user_agent = ? 
     AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
     LIMIT 1`,
    [recipeId, clientIp, userAgent],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi cập nhật view!", updated: false });
      }
      
      if (result.length > 0) {
        // Đã xem trong 30 phút rồi, không tăng view
        return res.json({ message: "⏳ Bạn đã xem công thức này gần đây", updated: false });
      }
      
      // Chưa xem, tăng view và lưu record
      db.query(
        "UPDATE cong_thuc SET views = COALESCE(views, 0) + 1 WHERE id = ?",
        [recipeId],
        (err1) => {
          if (err1) {
            return res.status(500).json({ message: "❌ Lỗi cập nhật view!", updated: false });
          }
          
          // Lưu record view
          db.query(
            "INSERT INTO recipe_views (recipe_id, client_ip, user_agent) VALUES (?, ?, ?)",
            [recipeId, clientIp, userAgent],
            (err2) => {
              if (err2) {
                console.warn("⚠️  Cảnh báo: Không lưu được record view", err2.message);
              }
              res.json({ message: "✅ Cảm ơn bạn đã xem công thức!", updated: true });
            }
          );
        }
      );
    }
  );
});

// ✅ API upload ảnh từng bước
router.post("/upload-step-images/:id", verifyToken, uploadMultiple.array("images", 20), async (req, res) => {
  try {
    const { id } = req.params;
    const { stepIndex } = req.body;
    const user_id = req.user.id;

    const parsedStepIndex = Number.isFinite(Number(stepIndex)) ? Number(stepIndex) : null;
    if (parsedStepIndex === null || parsedStepIndex < 0 || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: "❌ Thiếu hoặc sai stepIndex/ảnh!" });
    }

    // Verify ownership
    db.query("SELECT user_id FROM cong_thuc WHERE id = ?", [id], async (err, result) => {
      if (err || !result.length || result[0].user_id !== user_id) {
        return res.status(403).json({ message: "❌ Không có quyền!" });
      }

      try {
        const uploadedImages = [];
        for (const file of req.files) {
          let imageUrl = null;

          if (isCloudinaryConfigured()) {
            try {
              const uploadImg = await cloudinary.uploader.upload(file.path);
              imageUrl = uploadImg.secure_url;
              fs.unlink(file.path, () => {});
            } catch (uploadErr) {
              console.warn("⚠️  Cloudinary failed, using local fallback");
              try {
                const ext = path.extname(file.originalname) || "";
                const newName = file.filename + ext;
                const target = path.join(__dirname, "..", "uploads", newName);
                fs.renameSync(file.path, target);
                imageUrl = `http://localhost:3001/uploads/${newName}`;
              } catch (localErr) {
                console.warn("⚠️  Local fallback failed");
                try { fs.unlinkSync(file.path); } catch(e){}
              }
            }
          } else {
            try {
              const ext = path.extname(file.originalname) || "";
              const newName = file.filename + ext;
              const target = path.join(__dirname, "..", "uploads", newName);
              fs.renameSync(file.path, target);
              imageUrl = `http://localhost:3001/uploads/${newName}`;
            } catch (localErr) {
              console.warn("⚠️  Local fallback failed");
              try { fs.unlinkSync(file.path); } catch(e){}
            }
          }

          if (imageUrl) {
            // Tránh nhân đôi: chỉ chèn nếu chưa tồn tại (recipe_id, step_index, image_url)
            db.query(
              "SELECT id FROM step_images WHERE recipe_id = ? AND step_index = ? AND image_url = ? LIMIT 1",
              [id, parsedStepIndex, imageUrl],
              (checkErr, rows) => {
                if (checkErr) return; // bỏ qua, không chặn request
                if (rows && rows.length > 0) {
                  // đã tồn tại -> không chèn, nhưng vẫn trả về trong danh sách để UI đồng bộ
                  uploadedImages.push(imageUrl);
                } else {
                  db.query(
                    "INSERT INTO step_images (recipe_id, step_index, image_url) VALUES (?, ?, ?)",
                    [id, parsedStepIndex, imageUrl],
                    (insErr) => {
                      if (!insErr) uploadedImages.push(imageUrl);
                    }
                  );
                }
              }
            );
          }
        }

        // Wait for all inserts
        setTimeout(() => {
          res.json({ 
            message: "✅ Upload ảnh thành công!",
            images: uploadedImages 
          });
        }, 500);
      } catch (err) {
        res.status(500).json({ message: "❌ Lỗi upload ảnh!" });
      }
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// ✅ Xóa hình ảnh từng bước
router.delete("/delete-step-image/:id/:imageId", verifyToken, (req, res) => {
  try {
    const { id, imageId } = req.params;
    const user_id = req.user.id;

    // Verify ownership
    db.query(
      "SELECT si.id, ct.user_id FROM step_images si JOIN cong_thuc ct ON si.recipe_id = ct.id WHERE si.id = ? AND ct.id = ?",
      [imageId, id],
      (err, result) => {
        if (err || !result.length || result[0].user_id !== user_id) {
          return res.status(403).json({ message: "❌ Không có quyền!" });
        }

        // Xóa từ database
        db.query("DELETE FROM step_images WHERE id = ?", [imageId], (err) => {
          if (err) {
            return res.status(500).json({ message: "❌ Lỗi xóa ảnh!" });
          }
          res.json({ message: "✅ Đã xóa ảnh!" });
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// ✅ API Admin ẩn bài viết thủ công
router.put("/hide/:id", verifyToken, (req, res) => {
  const recipeId = req.params.id;
  const { reason } = req.body;
  const adminId = req.user.id;
  const userRole = req.user.role;

  // Kiểm tra quyền
  if (!['admin', 'moderator'].includes(userRole)) {
    return res.status(403).json({ message: "❌ Chỉ admin/moderator mới có quyền ẩn bài viết!" });
  }

  // Validate lý do
  if (!reason || reason.trim() === "") {
    return res.status(400).json({ message: "❌ Vui lòng nhập lý do ẩn bài viết!" });
  }

  // Lấy thông tin bài viết và tác giả
  db.query(
    `SELECT cr.id, cr.title, cr.user_id, u.username, u.email
     FROM cong_thuc cr
     JOIN nguoi_dung u ON cr.user_id = u.id
     WHERE cr.id = ?`,
    [recipeId],
    (err, recipes) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi truy vấn bài viết!" });
      }
      if (recipes.length === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy bài viết!" });
      }

      const recipe = recipes[0];

      // Kiểm tra xem bài viết đã bị ẩn thủ công chưa
      db.query(
        "SELECT id FROM admin_hidden_recipes WHERE recipe_id = ? AND is_active = TRUE",
        [recipeId],
        (err, existingHidden) => {
          if (err) {
            return res.status(500).json({ message: "❌ Lỗi kiểm tra trạng thái ẩn!" });
          }
          if (existingHidden.length > 0) {
            return res.status(409).json({ message: "❌ Bài viết đã bị ẩn thủ công trước đó!" });
          }

          // Bắt đầu transaction
          db.beginTransaction((err) => {
            if (err) {
              return res.status(500).json({ message: "❌ Lỗi bắt đầu transaction!" });
            }

            // 1. Ẩn bài viết
            db.query(
              "UPDATE cong_thuc SET is_hidden = TRUE WHERE id = ?",
              [recipeId],
              (err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ message: "❌ Lỗi ẩn bài viết!" });
                  });
                }

                // 2. Lưu lý do ẩn
                db.query(
                  "INSERT INTO admin_hidden_recipes (recipe_id, hidden_by, reason, is_active) VALUES (?, ?, ?, TRUE)",
                  [recipeId, adminId, reason],
                  (err, result) => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).json({ message: "❌ Lỗi lưu lý do ẩn!" });
                      });
                    }

                    // 3. Tạo thông báo cho tác giả
                    const notificationMessage = `Bài viết "${recipe.title}" của bạn đã bị ẩn. Lý do: ${reason}`;
                    db.query(
                      `INSERT INTO notifications (user_id, type, recipe_id, message, is_read)
                       VALUES (?, 'recipe_hidden', ?, ?, FALSE)`,
                      [recipe.user_id, recipeId, notificationMessage],
                      (err) => {
                        if (err) {
                          console.error("⚠️ Lỗi tạo thông báo:", err);
                          // Không rollback, vẫn commit transaction
                        }

                        // 4. Gửi email thông báo cho tác giả
                        const mailer = require("../config/mailer");
                        const mailOptions = {
                          from: process.env.SMTP_FROM || process.env.SMTP_USER,
                          to: recipe.email,
                          subject: "CookShare - Cảnh báo: Bài viết của bạn đã bị ẩn",
                          html: `
                            <p>Xin chào <b>${recipe.username}</b>,</p>
                            <p>Bài viết "<b>${recipe.title}</b>" của bạn đã bị quản trị viên ẩn vì vi phạm quy định.</p>
                            <p><b>Lý do:</b> ${reason}</p>
                            <p>Vui lòng xem xét và chỉnh sửa nội dung để tuân thủ quy định của CookShare.</p>
                            <p>Nếu bạn có thắc mắc, vui lòng liên hệ với quản trị viên.</p>
                            <hr />
                            <p>Trân trọng,<br/>Đội ngũ CookShare</p>
                          `,
                        };

                        mailer.sendMail(mailOptions, (mailErr) => {
                          if (mailErr) {
                            console.error("⚠️ Lỗi gửi email:", mailErr);
                          } else {
                            console.log("✅ Email cảnh báo đã gửi cho tác giả");
                          }
                        });

                        // Commit transaction
                        db.commit((err) => {
                          if (err) {
                            return db.rollback(() => {
                              res.status(500).json({ message: "❌ Lỗi commit transaction!" });
                            });
                          }

                          res.json({
                            message: "✅ Đã ẩn bài viết và gửi thông báo cho tác giả!",
                            hiddenRecordId: result.insertId,
                          });
                        });
                      }
                    );
                  }
                );
              }
            );
          });
        }
      );
    }
  );
});

// ✅ API Admin bỏ ẩn bài viết
router.put("/unhide/:id", verifyToken, (req, res) => {
  const recipeId = req.params.id;
  const adminId = req.user.id;
  const userRole = req.user.role;

  // Kiểm tra quyền
  if (!['admin', 'moderator'].includes(userRole)) {
    return res.status(403).json({ message: "❌ Chỉ admin/moderator mới có quyền bỏ ẩn bài viết!" });
  }

  // Kiểm tra xem bài viết có đang bị ẩn thủ công không
  db.query(
    `SELECT ahr.id, cr.title, cr.user_id, u.username, u.email
     FROM admin_hidden_recipes ahr
     JOIN cong_thuc cr ON ahr.recipe_id = cr.id
     JOIN nguoi_dung u ON cr.user_id = u.id
     WHERE ahr.recipe_id = ? AND ahr.is_active = TRUE`,
    [recipeId],
    (err, hiddenRecords) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi truy vấn!" });
      }

      // Nếu không có record ẩn thủ công, chỉ bỏ ẩn và reset violation_count
      if (hiddenRecords.length === 0) {
        db.query(
          "UPDATE cong_thuc SET is_hidden = FALSE, violation_count = 0 WHERE id = ?",
          [recipeId],
          (err, result) => {
            if (err) {
              return res.status(500).json({ message: "❌ Lỗi bỏ ẩn bài viết!" });
            }
            if (result.affectedRows === 0) {
              return res.status(404).json({ message: "❌ Không tìm thấy bài viết!" });
            }
            res.json({ message: "✅ Đã bỏ ẩn bài viết thành công!" });
          }
        );
        return;
      }

      const hiddenRecord = hiddenRecords[0];

      // Transaction: bỏ ẩn bài viết + cập nhật record + tạo thông báo
      db.beginTransaction((err) => {
        if (err) {
          return res.status(500).json({ message: "❌ Lỗi bắt đầu transaction!" });
        }

        // 1. Bỏ ẩn bài viết
        db.query(
          "UPDATE cong_thuc SET is_hidden = FALSE, violation_count = 0 WHERE id = ?",
          [recipeId],
          (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: "❌ Lỗi bỏ ẩn bài viết!" });
              });
            }

            // 2. Cập nhật record ẩn thủ công
            db.query(
              "UPDATE admin_hidden_recipes SET is_active = FALSE, unhidden_by = ?, unhidden_at = CURRENT_TIMESTAMP WHERE id = ?",
              [adminId, hiddenRecord.id],
              (err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ message: "❌ Lỗi cập nhật record!" });
                  });
                }

                // 3. Tạo thông báo cho tác giả
                const notificationMessage = `Bài viết "${hiddenRecord.title}" của bạn đã được bỏ ẩn và có thể hiển thị công khai.`;
                db.query(
                  `INSERT INTO notifications (user_id, type, recipe_id, message, is_read)
                   VALUES (?, 'recipe_unhidden', ?, ?, FALSE)`,
                  [hiddenRecord.user_id, recipeId, notificationMessage],
                  (err) => {
                    if (err) {
                      console.error("⚠️ Lỗi tạo thông báo:", err);
                    }

                    // 4. Gửi email thông báo
                    const mailer = require("../config/mailer");
                    const mailOptions = {
                      from: process.env.SMTP_FROM || process.env.SMTP_USER,
                      to: hiddenRecord.email,
                      subject: "CookShare - Bài viết của bạn đã được bỏ ẩn",
                      html: `
                        <p>Xin chào <b>${hiddenRecord.username}</b>,</p>
                        <p>Bài viết "<b>${hiddenRecord.title}</b>" của bạn đã được quản trị viên bỏ ẩn và hiện có thể hiển thị công khai.</p>
                        <p>Cảm ơn bạn đã chỉnh sửa và tuân thủ quy định của CookShare.</p>
                        <hr />
                        <p>Trân trọng,<br/>Đội ngũ CookShare</p>
                      `,
                    };

                    mailer.sendMail(mailOptions, (mailErr) => {
                      if (mailErr) {
                        console.error("⚠️ Lỗi gửi email:", mailErr);
                      } else {
                        console.log("✅ Email thông báo bỏ ẩn đã gửi");
                      }
                    });

                    // Commit transaction
                    db.commit((err) => {
                      if (err) {
                        return db.rollback(() => {
                          res.status(500).json({ message: "❌ Lỗi commit transaction!" });
                        });
                      }

                      res.json({ message: "✅ Đã bỏ ẩn bài viết và gửi thông báo cho tác giả!" });
                    });
                  }
                );
              }
            );
          }
        );
      });
    }
  );
});

// ✅ API Admin xóa bài viết bị ẩn thủ công (tương tự bác bỏ báo cáo)
router.delete("/admin-hidden/:id", verifyToken, (req, res) => {
  const hiddenRecordId = req.params.id;
  const adminId = req.user.id;
  const userRole = req.user.role;

  // Kiểm tra quyền
  if (!['admin', 'moderator'].includes(userRole)) {
    return res.status(403).json({ message: "❌ Chỉ admin/moderator mới có quyền xóa record ẩn!" });
  }

  // Lấy thông tin record
  db.query(
    `SELECT ahr.*, cr.title
     FROM admin_hidden_recipes ahr
     JOIN cong_thuc cr ON ahr.recipe_id = cr.id
     WHERE ahr.id = ? AND ahr.is_active = TRUE`,
    [hiddenRecordId],
    (err, records) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi truy vấn!" });
      }
      if (records.length === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy record ẩn hoặc đã bị xóa!" });
      }

      const record = records[0];

      // Transaction: bỏ ẩn bài viết + xóa record
      db.beginTransaction((err) => {
        if (err) {
          return res.status(500).json({ message: "❌ Lỗi bắt đầu transaction!" });
        }

        // 1. Bỏ ẩn bài viết
        db.query(
          "UPDATE cong_thuc SET is_hidden = FALSE WHERE id = ?",
          [record.recipe_id],
          (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: "❌ Lỗi bỏ ẩn bài viết!" });
              });
            }

            // 2. Xóa/vô hiệu hóa record
            db.query(
              "UPDATE admin_hidden_recipes SET is_active = FALSE, unhidden_by = ?, unhidden_at = CURRENT_TIMESTAMP WHERE id = ?",
              [adminId, hiddenRecordId],
              (err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ message: "❌ Lỗi xóa record!" });
                  });
                }

                // Commit transaction
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ message: "❌ Lỗi commit transaction!" });
                    });
                  }

                  res.json({ message: "✅ Đã bác bỏ việc ẩn bài viết!" });
                });
              }
            );
          }
        );
      });
    }
  );
});

module.exports = router;
