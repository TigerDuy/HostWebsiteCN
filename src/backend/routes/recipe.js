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
    const { title, ingredients, steps } = req.body;
    const user_id = req.user.id;

    if (!title || !ingredients || !steps) {
      return res.status(400).json({ message: "❌ Vui lòng điền đầy đủ thông tin!" });
    }

    let imageUrl = null;

    if (req.file) {
      const isVideo = (req.file.mimetype || "").startsWith("video/");
      if (isCloudinaryConfigured()) {
        try {
          const uploadOptions = isVideo ? { resource_type: 'video' } : { resource_type: 'image' };
          const uploadImg = await cloudinary.uploader.upload(req.file.path, uploadOptions);
          imageUrl = uploadImg.secure_url;
          fs.unlink(req.file.path, () => {});
        } catch (uploadErr) {
          console.warn("⚠️  Cloudinary upload failed, attempt local fallback:", uploadErr.message);
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
      } else {
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

    const result = await db.query(
      `INSERT INTO cong_thuc (user_id, title, ingredients, steps, image_url, servings, cook_time, category, cuisine, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING id`,
      [user_id, title, ingredients, steps, imageUrl, req.body.servings || "0", req.body.cook_time || "0", category, cuisine]
    );

    const recipeId = result[0]?.id;

    // Add tags if provided
    if (tagIds.length > 0 && recipeId) {
      for (const tagId of tagIds) {
        await db.query(
          "INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [recipeId, tagId]
        );
      }
      await db.query("UPDATE tags SET usage_count = (SELECT COUNT(*) FROM recipe_tags WHERE tag_id = tags.id)");
    }

    res.json({ message: "✅ Tạo công thức thành công!", id: recipeId });
  } catch (err) {
    console.error("❌ Lỗi tạo công thức:", err);
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// ✅ API lấy danh sách công thức (với stats, filter, pagination)
router.get("/list", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  const category = req.query.category || null;
  const cuisine = req.query.cuisine || null;
  const tag = req.query.tag || null;

  let conditions = ["cong_thuc.is_hidden = FALSE"];
  let params = [];
  let paramIndex = 1;

  if (category) {
    conditions.push(`cong_thuc.category = $${paramIndex++}`);
    params.push(category);
  }
  if (cuisine) {
    conditions.push(`cong_thuc.cuisine = $${paramIndex++}`);
    params.push(cuisine);
  }

  let joinTag = "";
  if (tag) {
    joinTag = "JOIN recipe_tags rt ON cong_thuc.id = rt.recipe_id JOIN tags t ON rt.tag_id = t.id";
    conditions.push(`t.slug = $${paramIndex++}`);
    params.push(tag);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const countResult = await db.query(
      `SELECT COUNT(DISTINCT cong_thuc.id) as total 
       FROM cong_thuc 
       JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id
       ${joinTag}
       ${whereClause}`,
      params
    );

    const total = parseInt(countResult[0]?.total) || 0;

    const result = await db.query(`
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
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `, [...params, limit, offset]);

    res.json({
      data: result,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách công thức:", err);
    res.status(500).json({ message: "❌ Lỗi khi lấy danh sách công thức!" });
  }
});

// ✅ API lấy danh sách tags
router.get("/tags", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tags ORDER BY usage_count DESC, name ASC");
    res.json(result);
  } catch (err) {
    console.error("❌ Lỗi lấy tags:", err);
    res.status(500).json({ message: "❌ Lỗi lấy tags!" });
  }
});

// ✅ API tạo tag mới
router.post("/tags", verifyToken, async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "❌ Tên tag phải có ít nhất 2 ký tự!" });
  }

  const slug = name.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  try {
    await db.query(
      "INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING",
      [name.trim(), slug]
    );

    const tags = await db.query("SELECT * FROM tags WHERE slug = $1", [slug]);
    if (tags.length === 0) {
      return res.status(500).json({ message: "❌ Lỗi lấy tag!" });
    }
    res.json(tags[0]);
  } catch (err) {
    console.error("❌ Lỗi tạo tag:", err);
    res.status(500).json({ message: "❌ Lỗi tạo tag!" });
  }
});

// ✅ API lấy tags của một công thức
router.get("/tags/:recipeId", async (req, res) => {
  const { recipeId } = req.params;
  try {
    const result = await db.query(
      `SELECT t.* FROM tags t 
       JOIN recipe_tags rt ON t.id = rt.tag_id 
       WHERE rt.recipe_id = $1`,
      [recipeId]
    );
    res.json(result);
  } catch (err) {
    console.error("❌ Lỗi lấy tags:", err);
    res.status(500).json({ message: "❌ Lỗi lấy tags!" });
  }
});

// ✅ API cập nhật tags cho công thức
router.put("/tags/:recipeId", verifyToken, async (req, res) => {
  const { recipeId } = req.params;
  const { tagIds } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query("SELECT user_id FROM cong_thuc WHERE id = $1", [recipeId]);
    if (result.length === 0) return res.status(404).json({ message: "❌ Không tìm thấy công thức!" });
    if (result[0].user_id !== userId) return res.status(403).json({ message: "❌ Không có quyền!" });

    await db.query("DELETE FROM recipe_tags WHERE recipe_id = $1", [recipeId]);

    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await db.query(
          "INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [recipeId, tagId]
        );
      }
    }

    await db.query("UPDATE tags SET usage_count = (SELECT COUNT(*) FROM recipe_tags WHERE tag_id = tags.id)");
    res.json({ message: "✅ Đã cập nhật tags!" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật tags:", err);
    res.status(500).json({ message: "❌ Lỗi cập nhật tags!" });
  }
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
router.get("/search", async (req, res) => {
  const q = req.query.q || "";
  
  try {
    const result = await db.query(`
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
      WHERE cong_thuc.title ILIKE $1 AND cong_thuc.is_hidden = FALSE
      GROUP BY cong_thuc.id, nguoi_dung.id, nguoi_dung.username, nguoi_dung.avatar_url
      ORDER BY avg_rating DESC, cong_thuc.created_at DESC
    `, [`%${q}%`]);
    res.json(result);
  } catch (err) {
    console.error("❌ Lỗi tìm kiếm:", err);
    res.status(500).json({ message: "❌ Lỗi tìm kiếm!" });
  }
});

// ✅ API xem chi tiết công thức theo ID (với stats)
router.get("/detail/:id", async (req, res) => {
  const recipeId = req.params.id;

  try {
    const result = await db.query(`
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
      WHERE cong_thuc.id = $1
      GROUP BY cong_thuc.id, nguoi_dung.id, nguoi_dung.username, nguoi_dung.avatar_url
    `, [recipeId]);

    if (result.length === 0) {
      return res.status(404).json({ message: "❌ Không tìm thấy công thức!" });
    }

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
    const images = await db.query(
      "SELECT id, step_index, image_url FROM step_images WHERE recipe_id = $1 ORDER BY step_index ASC, id ASC",
      [recipeId]
    );

    if (images && images.length > 0) {
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
  } catch (err) {
    console.error("❌ Lỗi lấy chi tiết công thức:", err);
    res.status(500).json({ message: "❌ Lỗi lấy chi tiết công thức!" });
  }
});

// ✅ API thêm bình luận
router.post("/comment", verifyToken, async (req, res) => {
  const { recipe_id, comment, parent_comment_id } = req.body;
  const user_id = req.user.id;

  if (!comment || !recipe_id) {
    return res.status(400).json({ message: "❌ Bình luận không được để trống!" });
  }

  try {
    const result = await db.query(
      "INSERT INTO binh_luan (recipe_id, user_id, comment, parent_comment_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
      [recipe_id, user_id, comment, parent_comment_id || null]
    );
    res.json({ message: "✅ Đã gửi bình luận!", id: result[0]?.id });
  } catch (err) {
    console.error("❌ Lỗi thêm bình luận:", err);
    res.status(500).json({ message: "❌ Lỗi khi thêm bình luận!" });
  }
});

// ✅ API lấy danh sách bình luận (nested)
router.get("/comment/:id", async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.query.userId || 0;

  try {
    const result = await db.query(
      `SELECT binh_luan.*, nguoi_dung.username, nguoi_dung.avatar_url,
       (SELECT COUNT(*) FROM comment_likes WHERE comment_id = binh_luan.id) as like_count,
       (SELECT COUNT(*) > 0 FROM comment_likes WHERE comment_id = binh_luan.id AND user_id = $1) as user_liked
       FROM binh_luan 
       JOIN nguoi_dung ON binh_luan.user_id = nguoi_dung.id
       WHERE recipe_id = $2
       ORDER BY binh_luan.created_at ASC`,
      [userId, recipeId]
    );

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
  } catch (err) {
    console.error("❌ Lỗi lấy bình luận:", err);
    res.status(500).json({ message: "❌ Lỗi khi lấy bình luận!" });
  }
});

// ✅ API cập nhật bình luận
router.put("/comment/:id", verifyToken, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;
  const { comment } = req.body;

  if (!comment || comment.trim() === "") {
    return res.status(400).json({ message: "❌ Bình luận không được để trống!" });
  }

  try {
    const result = await db.query("SELECT user_id FROM binh_luan WHERE id = $1", [commentId]);
    if (result.length === 0) {
      return res.status(400).json({ message: "❌ Bình luận không tồn tại!" });
    }
    if (result[0].user_id !== userId) {
      return res.status(403).json({ message: "❌ Bạn không có quyền chỉnh sửa bình luận này!" });
    }

    await db.query("UPDATE binh_luan SET comment = $1 WHERE id = $2", [comment, commentId]);
    res.json({ message: "✅ Đã cập nhật bình luận!" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật bình luận:", err);
    res.status(500).json({ message: "❌ Lỗi khi cập nhật bình luận!" });
  }
});

// ✅ API xóa bình luận
router.delete("/comment/:id", verifyToken, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query("SELECT user_id FROM binh_luan WHERE id = $1", [commentId]);
    if (result.length === 0) {
      return res.status(400).json({ message: "❌ Bình luận không tồn tại!" });
    }
    if (result[0].user_id !== userId) {
      return res.status(403).json({ message: "❌ Bạn không có quyền xóa bình luận này!" });
    }

    await db.query("DELETE FROM binh_luan WHERE id = $1", [commentId]);
    res.json({ message: "✅ Đã xóa bình luận!" });
  } catch (err) {
    console.error("❌ Lỗi xóa bình luận:", err);
    res.status(500).json({ message: "❌ Lỗi khi xóa bình luận!" });
  }
});

// ✅ API like/unlike comment
router.post("/comment/:id/like", verifyToken, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
      [commentId, userId]
    );

    if (result.length > 0) {
      await db.query("DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2", [commentId, userId]);
      res.json({ liked: false });
    } else {
      await db.query("INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)", [commentId, userId]);
      res.json({ liked: true });
    }
  } catch (err) {
    console.error("❌ Lỗi like:", err);
    res.status(500).json({ message: "❌ Lỗi like!" });
  }
});

// ✅ API lấy danh sách công thức của user đang đăng nhập (với stats)
router.get("/my", verifyToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await db.query(`
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
      WHERE cong_thuc.user_id = $1
      GROUP BY cong_thuc.id, nguoi_dung.id, nguoi_dung.username, nguoi_dung.avatar_url
      ORDER BY cong_thuc.created_at DESC
    `, [user_id]);
    res.json(result);
  } catch (err) {
    console.error("❌ Lỗi lấy công thức của tôi:", err);
    res.status(500).json({ message: "❌ Lỗi khi lấy công thức của tôi!" });
  }
});

// ✅ API lấy công thức theo user ID (pagination + stats)
router.get("/author/:userId", async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;

  try {
    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM cong_thuc WHERE user_id = $1",
      [userId]
    );
    const total = parseInt(countResult[0]?.total) || 0;

    const result = await db.query(`
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
      WHERE cong_thuc.user_id = $1
      GROUP BY cong_thuc.id, nguoi_dung.id, nguoi_dung.username, nguoi_dung.avatar_url
      ORDER BY cong_thuc.created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    res.json({ data: result, page, limit, total });
  } catch (err) {
    console.error("❌ Lỗi lấy công thức:", err);
    res.status(500).json({ message: "❌ Lỗi lấy công thức!" });
  }
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

    let newImageUrl = null;

    if (req.file) {
      if (isCloudinaryConfigured()) {
        try {
          const uploadImg = await cloudinary.uploader.upload(req.file.path);
          newImageUrl = uploadImg.secure_url;
          fs.unlink(req.file.path, () => {});
        } catch (uploadErr) {
          console.warn("⚠️  Cloudinary upload failed on update:", uploadErr.message);
        }
      }

      if (!newImageUrl) {
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
    }

    let result;
    if (newImageUrl) {
      result = await db.query(
        "UPDATE cong_thuc SET title=$1, ingredients=$2, steps=$3, servings=$4, cook_time=$5, category=$6, cuisine=$7, image_url=$8 WHERE id=$9 AND user_id=$10",
        [title, ingredients, steps, req.body.servings || "0", req.body.cook_time || "0", category, cuisine, newImageUrl, recipeId, user_id]
      );
    } else {
      result = await db.query(
        "UPDATE cong_thuc SET title=$1, ingredients=$2, steps=$3, servings=$4, cook_time=$5, category=$6, cuisine=$7 WHERE id=$8 AND user_id=$9",
        [title, ingredients, steps, req.body.servings || "0", req.body.cook_time || "0", category, cuisine, recipeId, user_id]
      );
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "❌ Bạn không có quyền cập nhật công thức này!" });
    }

    res.json({ message: "✅ Cập nhật thành công!" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật công thức:", err);
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// ✅ API xóa công thức
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const user_id = req.user.id;

  try {
    const result = await db.query(
      "DELETE FROM cong_thuc WHERE id = $1 AND user_id = $2",
      [recipeId, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "❌ Bạn không có quyền xóa công thức này!" });
    }

    res.json({ message: "✅ Xóa công thức thành công!" });
  } catch (err) {
    console.error("❌ Lỗi xóa công thức:", err);
    res.status(500).json({ message: "❌ Lỗi khi xóa công thức!" });
  }
});

// ✅ API view counter (chặn spam: 1 view/user/recipe/1 phút)
router.post("/view/:id", async (req, res) => {
  const recipeId = req.params.id;
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';

  try {
    const result = await db.query(
      `SELECT id FROM recipe_views 
       WHERE recipe_id = $1 AND client_ip = $2 AND user_agent = $3 
       AND created_at > NOW() - INTERVAL '1 minute'
       LIMIT 1`,
      [recipeId, clientIp, userAgent]
    );

    if (result.length > 0) {
      return res.json({ message: "⏳ Bạn đã xem công thức này gần đây", updated: false });
    }

    await db.query(
      "UPDATE cong_thuc SET views = COALESCE(views, 0) + 1 WHERE id = $1",
      [recipeId]
    );

    await db.query(
      "INSERT INTO recipe_views (recipe_id, client_ip, user_agent) VALUES ($1, $2, $3)",
      [recipeId, clientIp, userAgent]
    );

    res.json({ message: "✅ Cảm ơn bạn đã xem công thức!", updated: true });
  } catch (err) {
    console.error("❌ Lỗi cập nhật view:", err);
    res.status(500).json({ message: "❌ Lỗi cập nhật view!", updated: false });
  }
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

    const result = await db.query("SELECT user_id FROM cong_thuc WHERE id = $1", [id]);
    if (result.length === 0 || result[0].user_id !== user_id) {
      return res.status(403).json({ message: "❌ Không có quyền!" });
    }

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
        const existing = await db.query(
          "SELECT id FROM step_images WHERE recipe_id = $1 AND step_index = $2 AND image_url = $3 LIMIT 1",
          [id, parsedStepIndex, imageUrl]
        );

        if (existing.length === 0) {
          await db.query(
            "INSERT INTO step_images (recipe_id, step_index, image_url) VALUES ($1, $2, $3)",
            [id, parsedStepIndex, imageUrl]
          );
        }
        uploadedImages.push(imageUrl);
      }
    }

    res.json({ message: "✅ Upload ảnh thành công!", images: uploadedImages });
  } catch (err) {
    console.error("❌ Lỗi upload ảnh:", err);
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// ✅ Xóa hình ảnh từng bước
router.delete("/delete-step-image/:id/:imageId", verifyToken, async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const user_id = req.user.id;

    const result = await db.query(
      "SELECT si.id, ct.user_id FROM step_images si JOIN cong_thuc ct ON si.recipe_id = ct.id WHERE si.id = $1 AND ct.id = $2",
      [imageId, id]
    );

    if (result.length === 0 || result[0].user_id !== user_id) {
      return res.status(403).json({ message: "❌ Không có quyền!" });
    }

    await db.query("DELETE FROM step_images WHERE id = $1", [imageId]);
    res.json({ message: "✅ Đã xóa ảnh!" });
  } catch (err) {
    console.error("❌ Lỗi xóa ảnh:", err);
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// ✅ API Admin ẩn bài viết thủ công
router.put("/hide/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const { reason } = req.body;
  const adminId = req.user.id;
  const userRole = req.user.role;

  if (!['admin', 'moderator'].includes(userRole)) {
    return res.status(403).json({ message: "❌ Chỉ admin/moderator mới có quyền ẩn bài viết!" });
  }

  if (!reason || reason.trim() === "") {
    return res.status(400).json({ message: "❌ Vui lòng nhập lý do ẩn bài viết!" });
  }

  try {
    const recipes = await db.query(
      `SELECT cr.id, cr.title, cr.user_id, u.username, u.email
       FROM cong_thuc cr
       JOIN nguoi_dung u ON cr.user_id = u.id
       WHERE cr.id = $1`,
      [recipeId]
    );

    if (recipes.length === 0) {
      return res.status(404).json({ message: "❌ Không tìm thấy bài viết!" });
    }

    const recipe = recipes[0];

    const existingHidden = await db.query(
      "SELECT id FROM admin_hidden_recipes WHERE recipe_id = $1 AND is_active = TRUE",
      [recipeId]
    );

    if (existingHidden.length > 0) {
      return res.status(409).json({ message: "❌ Bài viết đã bị ẩn thủ công trước đó!" });
    }

    // Ẩn bài viết
    await db.query("UPDATE cong_thuc SET is_hidden = TRUE WHERE id = $1", [recipeId]);

    // Lưu lý do ẩn
    const hiddenResult = await db.query(
      "INSERT INTO admin_hidden_recipes (recipe_id, hidden_by, reason, is_active) VALUES ($1, $2, $3, TRUE) RETURNING id",
      [recipeId, adminId, reason]
    );

    // Tạo thông báo cho tác giả
    const notificationMessage = `Bài viết "${recipe.title}" của bạn đã bị ẩn. Lý do: ${reason}`;
    await db.query(
      `INSERT INTO notifications (user_id, type, recipe_id, message, is_read)
       VALUES ($1, 'recipe_hidden', $2, $3, FALSE)`,
      [recipe.user_id, recipeId, notificationMessage]
    );

    // Gửi email thông báo
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
        <hr />
        <p>Trân trọng,<br/>Đội ngũ CookShare</p>
      `,
    };

    mailer.sendMail(mailOptions, (mailErr) => {
      if (mailErr) console.error("⚠️ Lỗi gửi email:", mailErr);
    });

    res.json({
      message: "✅ Đã ẩn bài viết và gửi thông báo cho tác giả!",
      hiddenRecordId: hiddenResult[0]?.id,
    });
  } catch (err) {
    console.error("❌ Lỗi ẩn bài viết:", err);
    res.status(500).json({ message: "❌ Lỗi ẩn bài viết!" });
  }
});

// ✅ API Admin bỏ ẩn bài viết
router.put("/unhide/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const adminId = req.user.id;
  const userRole = req.user.role;

  if (!['admin', 'moderator'].includes(userRole)) {
    return res.status(403).json({ message: "❌ Chỉ admin/moderator mới có quyền bỏ ẩn bài viết!" });
  }

  try {
    const hiddenRecords = await db.query(
      `SELECT ahr.id, cr.title, cr.user_id, u.username, u.email
       FROM admin_hidden_recipes ahr
       JOIN cong_thuc cr ON ahr.recipe_id = cr.id
       JOIN nguoi_dung u ON cr.user_id = u.id
       WHERE ahr.recipe_id = $1 AND ahr.is_active = TRUE`,
      [recipeId]
    );

    if (hiddenRecords.length === 0) {
      // Không có record ẩn thủ công, chỉ bỏ ẩn và reset violation_count
      const result = await db.query(
        "UPDATE cong_thuc SET is_hidden = FALSE, violation_count = 0 WHERE id = $1",
        [recipeId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy bài viết!" });
      }
      return res.json({ message: "✅ Đã bỏ ẩn bài viết thành công!" });
    }

    const hiddenRecord = hiddenRecords[0];

    // Bỏ ẩn bài viết
    await db.query(
      "UPDATE cong_thuc SET is_hidden = FALSE, violation_count = 0 WHERE id = $1",
      [recipeId]
    );

    // Cập nhật record ẩn thủ công
    await db.query(
      "UPDATE admin_hidden_recipes SET is_active = FALSE, unhidden_by = $1, unhidden_at = CURRENT_TIMESTAMP WHERE id = $2",
      [adminId, hiddenRecord.id]
    );

    // Tạo thông báo cho tác giả
    const notificationMessage = `Bài viết "${hiddenRecord.title}" của bạn đã được bỏ ẩn và có thể hiển thị công khai.`;
    await db.query(
      `INSERT INTO notifications (user_id, type, recipe_id, message, is_read)
       VALUES ($1, 'recipe_unhidden', $2, $3, FALSE)`,
      [hiddenRecord.user_id, recipeId, notificationMessage]
    );

    // Gửi email thông báo
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
      if (mailErr) console.error("⚠️ Lỗi gửi email:", mailErr);
    });

    res.json({ message: "✅ Đã bỏ ẩn bài viết và gửi thông báo cho tác giả!" });
  } catch (err) {
    console.error("❌ Lỗi bỏ ẩn bài viết:", err);
    res.status(500).json({ message: "❌ Lỗi bỏ ẩn bài viết!" });
  }
});

// ✅ API Admin xóa bài viết bị ẩn thủ công
router.delete("/admin-hidden/:id", verifyToken, async (req, res) => {
  const hiddenRecordId = req.params.id;
  const adminId = req.user.id;
  const userRole = req.user.role;

  if (!['admin', 'moderator'].includes(userRole)) {
    return res.status(403).json({ message: "❌ Chỉ admin/moderator mới có quyền xóa record ẩn!" });
  }

  try {
    const records = await db.query(
      `SELECT ahr.*, cr.title
       FROM admin_hidden_recipes ahr
       JOIN cong_thuc cr ON ahr.recipe_id = cr.id
       WHERE ahr.id = $1 AND ahr.is_active = TRUE`,
      [hiddenRecordId]
    );

    if (records.length === 0) {
      return res.status(404).json({ message: "❌ Không tìm thấy record ẩn hoặc đã bị xóa!" });
    }

    const record = records[0];

    // Bỏ ẩn bài viết
    await db.query("UPDATE cong_thuc SET is_hidden = FALSE WHERE id = $1", [record.recipe_id]);

    // Xóa/vô hiệu hóa record
    await db.query(
      "UPDATE admin_hidden_recipes SET is_active = FALSE, unhidden_by = $1, unhidden_at = CURRENT_TIMESTAMP WHERE id = $2",
      [adminId, hiddenRecordId]
    );

    res.json({ message: "✅ Đã bác bỏ việc ẩn bài viết!" });
  } catch (err) {
    console.error("❌ Lỗi xóa record ẩn:", err);
    res.status(500).json({ message: "❌ Lỗi xóa record ẩn!" });
  }
});

module.exports = router;
