const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Tăng giới hạn cho base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug helpers to trace unexpected exit/crash
process.on('exit', (code) => {
  console.log('⚠️ Process exit with code', code);
});
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('🔥 Unhandled rejection:', reason);
});

// Serve uploaded files so local fallback images are accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Kết nối database (db.js đã tạo connection)
const db = require("./config/db");

// ✅ Auto setup database on first start (for Render FREE tier)
async function setupDatabase() {
  const schema = `
-- ENUM types
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE report_status AS ENUM ('pending', 'accepted', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE report_target AS ENUM ('recipe', 'comment', 'user'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Users
CREATE TABLE IF NOT EXISTS nguoi_dung (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user',
  avatar_url VARCHAR(500),
  bio TEXT,
  is_posting_blocked BOOLEAN DEFAULT FALSE,
  posting_blocked_until TIMESTAMP,
  is_commenting_blocked BOOLEAN DEFAULT FALSE,
  commenting_blocked_until TIMESTAMP,
  is_reporting_blocked BOOLEAN DEFAULT FALSE,
  reporting_blocked_until TIMESTAMP,
  monthly_post_violations INT DEFAULT 0,
  monthly_comment_violations INT DEFAULT 0,
  monthly_rejected_reports INT DEFAULT 0,
  last_violation_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  password_reset_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes
CREATE TABLE IF NOT EXISTS cong_thuc (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  image_url VARCHAR(500),
  servings VARCHAR(100),
  cook_time VARCHAR(100),
  category VARCHAR(50) DEFAULT 'other',
  cuisine VARCHAR(50) DEFAULT 'other',
  views INT DEFAULT 0,
  violation_count INT DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  hidden_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe views
CREATE TABLE IF NOT EXISTS recipe_views (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  client_ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step images
CREATE TABLE IF NOT EXISTS step_images (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  step_index INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments
CREATE TABLE IF NOT EXISTS binh_luan (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  parent_comment_id INT REFERENCES binh_luan(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comment likes
CREATE TABLE IF NOT EXISTS comment_likes (
  id SERIAL PRIMARY KEY,
  comment_id INT NOT NULL REFERENCES binh_luan(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorite (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, recipe_id)
);

-- Ratings
CREATE TABLE IF NOT EXISTS danh_gia (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id, user_id)
);

-- Follows
CREATE TABLE IF NOT EXISTS follows (
  id SERIAL PRIMARY KEY,
  follower_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  following_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe tags
CREATE TABLE IF NOT EXISTS recipe_tags (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(recipe_id, tag_id)
);

-- Reports
CREATE TABLE IF NOT EXISTS bao_cao (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  image_url VARCHAR(500),
  status report_status DEFAULT 'pending',
  rejected_reason TEXT,
  processed_by INT REFERENCES nguoi_dung(id) ON DELETE SET NULL,
  processed_at TIMESTAMP,
  target_type report_target DEFAULT 'recipe',
  recipe_id INT REFERENCES cong_thuc(id) ON DELETE CASCADE,
  comment_id INT REFERENCES binh_luan(id) ON DELETE CASCADE,
  reported_user_id INT REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Report quota
CREATE TABLE IF NOT EXISTS user_report_quota (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  report_type report_target NOT NULL,
  remaining_reports INT DEFAULT 3,
  last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, report_type)
);

-- Recipe violation history
CREATE TABLE IF NOT EXISTS recipe_violation_history (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  report_id INT NOT NULL REFERENCES bao_cao(id) ON DELETE CASCADE,
  violated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comment violation history
CREATE TABLE IF NOT EXISTS comment_violation_history (
  id SERIAL PRIMARY KEY,
  comment_id INT NOT NULL,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  report_id INT NOT NULL REFERENCES bao_cao(id) ON DELETE CASCADE,
  violated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  receiver_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  sender_role VARCHAR(20),
  type VARCHAR(50) DEFAULT 'manual',
  message TEXT NOT NULL,
  image_url VARCHAR(500),
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Broadcast notifications
CREATE TABLE IF NOT EXISTS broadcast_notifications (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User broadcast read
CREATE TABLE IF NOT EXISTS user_broadcast_read (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  broadcast_id INT NOT NULL REFERENCES broadcast_notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, broadcast_id)
);

-- Theme preferences
CREATE TABLE IF NOT EXISTS user_theme_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  theme_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Admin hidden recipes
CREATE TABLE IF NOT EXISTS admin_hidden_recipes (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  hidden_by INT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  reason TEXT,
  hidden_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id)
);
`;

  try {
    console.log('🔄 Auto-setup: Đang kiểm tra và tạo schema...');
    await db.pool.query(schema);
    console.log('✅ Auto-setup: Schema đã sẵn sàng!');
    
    // Tạo admin user nếu chưa có
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.pool.query(`
      INSERT INTO nguoi_dung (username, email, password, role)
      VALUES ('admin', 'admin@cookshare.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    console.log('✅ Auto-setup: Admin user đã sẵn sàng! (admin@cookshare.com / admin123)');
    
  } catch (err) {
    console.error('❌ Auto-setup lỗi:', err.message);
    // Không exit, để server vẫn chạy
  }
}

// Chạy setup khi server khởi động
setupDatabase();

// ✅ Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const recipeRoutes = require("./routes/recipe");
app.use("/recipe", recipeRoutes);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

const favoriteRoutes = require("./routes/favorite");
app.use("/favorite", favoriteRoutes);

// ✅ Thêm route đánh giá (Rating)
const ratingRoutes = require("./routes/rating");
app.use("/rating", ratingRoutes);

// ✅ Thêm route theo dõi (Follow)
const followRoutes = require("./routes/follow");
app.use("/follow", followRoutes);

// ✅ Thêm route theme
const themeRoutes = require("./routes/theme");
app.use("/theme", themeRoutes);

// ✅ Thêm route báo cáo
const reportRoutes = require("./routes/report");
app.use("/report", reportRoutes);

// ✅ Thêm route thông báo
const notificationRoutes = require("./routes/notification");
app.use("/notification", notificationRoutes);

// ✅ API Import Data (chỉ dùng 1 lần để migrate từ MySQL)
app.get("/import-data", async (req, res) => {
  const SECRET_KEY = "cookshare2026";
  if (req.query.key !== SECRET_KEY) {
    return res.status(403).json({ error: "Invalid key" });
  }
  
  try {
    const results = { users: 0, recipes: 0, follows: 0, favorites: 0, ratings: 0, comments: 0 };
    
    // Xóa data cũ trước (theo thứ tự FK)
    await db.pool.query(`DELETE FROM binh_luan`);
    await db.pool.query(`DELETE FROM danh_gia`);
    await db.pool.query(`DELETE FROM favorite`);
    await db.pool.query(`DELETE FROM follows`);
    await db.pool.query(`DELETE FROM cong_thuc`);
    await db.pool.query(`DELETE FROM nguoi_dung`);
    
    // Data từ MySQL
    const users = [
      { id: 1, username: 'Thanh Duy', email: 'TigerDuy2000@gmail.com', password: '$2b$10$ho56zHRrYaan5avYuzbyo.fQYDw09w0QABK/uWwku4o4ri3dw/JMq', role: 'moderator', bio: 'PiscesKing' },
      { id: 2, username: 'Admin', email: 'admin@gmail.com', password: '$2b$10$k55Zu8g8VWfnnab5klAsNeLqmHk8obZ.tCLES6nKE/WqANXpp9gz2', role: 'admin', bio: null },
      { id: 3, username: 'Phú Đức', email: 'PhuDuc@gmail.com', password: '$2b$10$k55Zu8g8VWfnnab5klAsNeLqmHk8obZ.tCLES6nKE/WqANXpp9gz2', role: 'moderator', bio: null },
      { id: 4, username: 'Gia Lộc', email: 'HaGiaLoc@gmail.com', password: '$2b$10$k55Zu8g8VWfnnab5klAsNeLqmHk8obZ.tCLES6nKE/WqANXpp9gz2', role: 'user', bio: null },
      { id: 5, username: 'Khải', email: 'PhanDinhKhai@gmail.com', password: '$2b$10$k55Zu8g8VWfnnab5klAsNeLqmHk8obZ.tCLES6nKE/WqANXpp9gz2', role: 'user', bio: null },
      { id: 6, username: 'Hoàng Lăm', email: 'HLam@gmail.com', password: '$2b$10$k55Zu8g8VWfnnab5klAsNeLqmHk8obZ.tCLES6nKE/WqANXpp9gz2', role: 'user', bio: null },
      { id: 7, username: 'test', email: 'test@gmail.com', password: '$2b$10$qQ8T8ISY5PtDNp/a2pZFoe8H9Ji1j8y4My2CStJm3Vnt8b2Z1etWe', role: 'user', bio: 'Tài khoảng test' }
    ];
    
    // Import users
    for (const u of users) {
      await db.pool.query(`INSERT INTO nguoi_dung (id, username, email, password, role, bio) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING`, [u.id, u.username, u.email, u.password, u.role, u.bio]);
      results.users++;
    }
    await db.pool.query(`SELECT setval('nguoi_dung_id_seq', (SELECT MAX(id) FROM nguoi_dung))`);
    
    // Import recipes (simplified)
    const recipes = [
      { id: 6, user_id: 3, title: 'Cơm cà ri gà', ingredients: '1/2 con gà, 1 gói cà ri bột, sữa tươi, khoai lang, hành tây, sả, hành tím, hành lá, gia vị', steps: 'Gà bóp muối rửa sạch, chặt nhỏ, ướp với muối đường và cà ri.||STEP||Khi sôi thì đậy nắp để nhỏ lửa cho gà thấm vị.||STEP||Cho khoai vào nồi, khoai mềm cho hành tây vào.||STEP||Múc cơm nóng ra dĩa, thêm cà ri xung quanh.', cook_time: '90 phút', servings: '3', views: 48, category: 'main', cuisine: 'vietnam' },
      { id: 7, user_id: 3, title: 'Lẩu Thái Hải Sản', ingredients: '1 kg tôm, 1 kg nghêu, 500 g mực, 500 g bò, nấm các loại, rau cải', steps: 'Tôm bỏ chỉ lưng, rửa sạch.||STEP||Đặt nồi nước lên bếp, cho gia vị tomyum vào nấu sôi.||STEP||Dọn tất cả lên bàn, nhúng các loại topping.', cook_time: '60', servings: '5', views: 26, category: 'main', cuisine: 'vietnam' },
      { id: 8, user_id: 3, title: 'Bò Lúc Lắc', ingredients: 'thịt bò, rau củ quả, tỏi, nước tương', steps: 'Ướp thịt với muối, hạt nêm, nước tương.||STEP||Sơ chế rau củ quả.||STEP||Xào thịt với tỏi phi thơm.', cook_time: '30 phút', servings: '2', views: 91, category: 'main', cuisine: 'vietnam' },
      { id: 31, user_id: 1, title: 'Phở Bò Hà Nội', ingredients: '1 kg thịt bò, 1 kg xương lợn, sá sùng khô, quế, hoa hồi, thảo quả, hành lá, rau thơm, gừng', steps: 'Rửa sạch xương bò.||STEP||Cho xương bò vào hầm.||STEP||Nướng chín hành, gừng.||STEP||Rang hoa hồi, quế, thảo quả.||STEP||Nấu sôi nước hầm bò.||STEP||Cắt lát mỏng thịt bò.||STEP||Cho thêm hành lá, rau mùi.', cook_time: '2 tiếng', servings: '6', views: 123, category: 'main', cuisine: 'vietnam' },
      { id: 32, user_id: 1, title: 'Cơm Tấm Sườn Nướng', ingredients: '2 miếng thịt cốt lếch, 2 quả trứng gà, dưa leo, sữa đặc, hành lá, gia vị', steps: 'Ướp thịt cốt lếch với hành đập dập, sữa đặc, nước mắm.||STEP||Cắt nhỏ hành lá.||STEP||Rửa sạch dưa leo.||STEP||Chiên trứng ốp la.||STEP||Nướng thịt.||STEP||Sắp mọi thứ lên đĩa.', cook_time: '0', servings: '2', views: 45, category: 'main', cuisine: 'vietnam' },
      { id: 33, user_id: 1, title: 'Bánh Mì Thịt Nướng', ingredients: 'bánh mì, đồ chua, thịt heo, xã băm, tỏi, ớt, cà chua, hành lá, nước mắm, đường, chanh', steps: 'Làm đồ chua đơn giản.||STEP||Xay hỗn hợp tỏi, hành, xã.||STEP||Sốt ướp thịt nướng.||STEP||Ướp thịt.||STEP||Nướng thịt.||STEP||Làm nước mắm.||STEP||Chuẩn bị các thành phần.||STEP||Cho vào bánh mì.', cook_time: '1 tiếng', servings: '2 - 3', views: 48, category: 'main', cuisine: 'vietnam' }
    ];
    
    for (const r of recipes) {
      await db.pool.query(`INSERT INTO cong_thuc (id, user_id, title, ingredients, steps, cook_time, servings, views, category, cuisine) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT DO NOTHING`, [r.id, r.user_id, r.title, r.ingredients, r.steps, r.cook_time, r.servings, r.views, r.category, r.cuisine]);
      results.recipes++;
    }
    await db.pool.query(`SELECT setval('cong_thuc_id_seq', (SELECT COALESCE(MAX(id), 1) FROM cong_thuc))`);
    
    // Import follows
    const follows = [[4,1],[3,1],[3,5],[3,4],[3,6],[2,1],[2,5],[2,3],[2,4],[2,6],[6,1],[6,3],[6,2],[6,4],[1,4],[1,3],[1,2],[1,6],[1,5],[5,4],[5,6],[5,2],[5,3],[5,1]];
    for (const [f, t] of follows) {
      await db.pool.query(`INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [f, t]);
      results.follows++;
    }
    
    // Import favorites
    const favorites = [[1,33],[1,31],[1,32],[6,21],[4,11],[5,20],[5,19],[3,6],[3,10],[3,9],[3,8],[3,7],[2,31],[2,6]];
    for (const [u, r] of favorites) {
      await db.pool.query(`INSERT INTO favorite (user_id, recipe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [u, r]);
      results.favorites++;
    }
    
    // Import ratings
    const ratings = [[33,2,5],[6,2,5],[33,1,4],[31,1,5],[32,1,5],[8,3,5],[7,3,5],[31,2,5],[8,1,5],[31,6,5],[31,4,5],[32,6,4],[32,4,4],[31,5,5],[31,3,1],[33,5,2],[6,1,4],[7,1,2],[8,6,2]];
    for (const [rec, usr, rat] of ratings) {
      await db.pool.query(`INSERT INTO danh_gia (recipe_id, user_id, rating) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [rec, usr, rat]);
      results.ratings++;
    }
    
    // Import comments
    const comments = [[8,1,'Nhìn ngon thế'],[8,4,'để nấu thử xem sao'],[8,6,'được á'],[8,2,'UKm'],[31,3,'Ăn được không'],[31,1,'Sao lại không nhỉ']];
    for (const [rec, usr, cmt] of comments) {
      await db.pool.query(`INSERT INTO binh_luan (recipe_id, user_id, comment) VALUES ($1, $2, $3)`, [rec, usr, cmt]);
      results.comments++;
    }
    
    res.json({ success: true, message: 'Import completed!', results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Scheduled Tasks - chạy mỗi giờ (optional, không crash nếu lỗi)
let scheduledTasks = null;
try {
  scheduledTasks = require("./scripts/scheduled_tasks");
} catch (err) {
  console.warn("⚠️ Không load được scheduled_tasks:", err.message);
}

if (scheduledTasks) {
  // Chạy ngay khi server khởi động
  setTimeout(() => {
    scheduledTasks.runAllTasks();
  }, 5000);

  // Chạy mỗi giờ
  setInterval(() => {
    scheduledTasks.runAllTasks();
  }, 60 * 60 * 1000); // 1 giờ
}

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend đang chạy tại port ${PORT}`);
});
