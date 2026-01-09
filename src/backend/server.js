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
    await db.pool.query(`DELETE FROM step_images`);
    await db.pool.query(`DELETE FROM recipe_views`);
    await db.pool.query(`DELETE FROM notifications`);
    await db.pool.query(`DELETE FROM admin_hidden_recipes`);
    await db.pool.query(`DELETE FROM user_report_quota`);
    await db.pool.query(`DELETE FROM bao_cao`);
    await db.pool.query(`DELETE FROM user_broadcast_read`);
    await db.pool.query(`DELETE FROM broadcast_notifications`);
    await db.pool.query(`DELETE FROM user_theme_preferences`);
    await db.pool.query(`DELETE FROM recipe_tags`);
    await db.pool.query(`DELETE FROM tags`);
    await db.pool.query(`DELETE FROM comment_likes`);
    await db.pool.query(`DELETE FROM binh_luan`);
    await db.pool.query(`DELETE FROM danh_gia`);
    await db.pool.query(`DELETE FROM favorite`);
    await db.pool.query(`DELETE FROM follows`);
    await db.pool.query(`DELETE FROM cong_thuc`);
    await db.pool.query(`DELETE FROM nguoi_dung WHERE email != 'admin@cookshare.com'`);
    
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
    
    // Import recipes (đầy đủ từ MySQL)
    const recipes = [
      { id: 6, user_id: 3, title: 'Cơm cà ri gà', ingredients: '1/2 con gà, 1 gói cà ri bột, sữa tươi, khoai lang, hành tây, sả', steps: 'Gà bóp muối rửa sạch, ướp với cà ri.||STEP||Khi sôi đậy nắp nhỏ lửa.||STEP||Cho khoai vào nồi.||STEP||Múc cơm ra dĩa.', cook_time: '90 phút', servings: '3', views: 48, category: 'main', cuisine: 'vietnam' },
      { id: 7, user_id: 3, title: 'Lẩu Thái Hải Sản', ingredients: '1 kg tôm, 1 kg nghêu, 500 g mực, 500 g bò, nấm các loại', steps: 'Tôm bỏ chỉ lưng, rửa sạch.||STEP||Cho gia vị tomyum vào nấu sôi.||STEP||Nhúng các loại topping.', cook_time: '60', servings: '5', views: 26, category: 'main', cuisine: 'vietnam' },
      { id: 8, user_id: 3, title: 'Bò Lúc Lắc', ingredients: 'thịt bò, rau củ quả, tỏi, nước tương', steps: 'Ướp thịt với muối, hạt nêm, nước tương.||STEP||Sơ chế rau củ quả.||STEP||Xào thịt với tỏi phi thơm.', cook_time: '30 phút', servings: '2', views: 91, category: 'main', cuisine: 'vietnam' },
      { id: 9, user_id: 3, title: 'Canh Chua Cá Hú', ingredients: '300g cá hú, đậu bắp, cà chua, bạc hà, thơm, me chua', steps: 'Cá hú rửa sạch, cắt khúc.||STEP||Nấu sôi nước, cho me vào.||STEP||Cho cá vào nồi nước me.', cook_time: '20 phút', servings: '2', views: 42, category: 'soup', cuisine: 'vietnam' },
      { id: 10, user_id: 3, title: 'Bánh Xèo Miền Tây', ingredients: '200g bột bánh xèo, bột nghệ, hành lá, tôm, thịt, giá', steps: 'Sơ chế nguyên liệu.||STEP||Trộn bột bánh.||STEP||Xào thịt và tôm.||STEP||Đổ bánh xèo.', cook_time: '1 tiếng', servings: '4', views: 28, category: 'main', cuisine: 'vietnam' },
      { id: 11, user_id: 4, title: 'Mì Xào Hải Sản', ingredients: '100g mì trứng, 300g hải sản đông lạnh, rau cải', steps: 'Mì luộc vừa chín tới.||STEP||Phi thơm hành, tỏi, cho hải sản vào xào.', cook_time: '30 phút', servings: '2', views: 32, category: 'main', cuisine: 'vietnam' },
      { id: 12, user_id: 4, title: 'Thịt Kho Tàu', ingredients: '600-900g thịt ba chỉ, hành khô, tỏi, xì dầu, mắm', steps: 'Thịt trần qua, cắt miếng.||STEP||Cho thịt vào đảo cùng hành tỏi.||STEP||Đun sôi, hạ nhỏ lửa 3 tiếng.', cook_time: '3-4 tiếng', servings: '3-4', views: 31, category: 'main', cuisine: 'vietnam' },
      { id: 13, user_id: 4, title: 'Gà Rán Giòn', ingredients: '50g bột mỳ, 50g bột ngô, 50g bột chiên giòn, 450g ức gà', steps: 'Sơ chế ức gà.||STEP||Rửa sạch với muối.||STEP||Lăn gà qua 3 bát bột rồi chiên.', cook_time: '45 phút', servings: '2', views: 33, category: 'snack', cuisine: 'vietnam' },
      { id: 14, user_id: 4, title: 'Súp hải sản măng tây', ingredients: '400g tôm sú, 200g cá hồi, 200g măng tây, nấm rơm, trứng gà', steps: 'Xương gà rửa sạch, ninh lấy nước dùng.||STEP||Tôm bóc vỏ, cắt hạt lựu.||STEP||Đun sôi nồi nước dùng, cho tôm cá vào.', cook_time: '45 phút', servings: '4', views: 33, category: 'soup', cuisine: 'vietnam' },
      { id: 15, user_id: 4, title: 'Nem Nướng Nha Trang', ingredients: '700g thịt nạc dăm, 300g giò sống, tỏi băm, bột năng', steps: 'Thịt xay nhuyễn, trộn với giò sống và gia vị.||STEP||Nướng nem trên lửa than.||STEP||Rau thơm rửa sạch.', cook_time: '2 Tiếng', servings: '5-6', views: 31, category: 'appetizer', cuisine: 'vietnam' },
      { id: 16, user_id: 5, title: 'Hủ Tiếu Nam Vang', ingredients: '1kg hủ tiếu dai, xương ống, mực khô, tôm khô, tim gan heo', steps: 'Xương ngâm nước muối, hầm cùng mực khô.||STEP||Tỏi phi vàng, làm nước sốt.||STEP||Trụng hủ tíu, chan nước dùng.', cook_time: '90 phút', servings: '5', views: 29, category: 'main', cuisine: 'vietnam' },
      { id: 17, user_id: 5, title: 'Cá tầm kho tộ', ingredients: '500g cá tầm, hành tăm, hành tây, tỏi, gừng, tiêu xanh', steps: 'Cá tầm làm sạch, ướp gia vị.||STEP||Phi hành tăm, xếp cá lên trên.||STEP||Cho nước sôi, nấu lửa nhỏ 20 phút.', cook_time: '30 phút', servings: '4', views: 32, category: 'main', cuisine: 'vietnam' },
      { id: 18, user_id: 5, title: 'Chả Giò Rế', ingredients: 'Thịt nạc, khoai cao, hành lá, nấm mèo, đường, tiêu', steps: 'Thịt nạc xay nhỏ, trộn với khoai cao và nấm mèo.||STEP||Quấn xong đem chiên vàng giòn.', cook_time: '1 tiếng', servings: '4', views: 32, category: 'appetizer', cuisine: 'vietnam' },
      { id: 19, user_id: 5, title: 'Bún Bò Huế', ingredients: '1.5kg xương bò, 1.5kg bắp bò, 1kg chân giò, sả, mắm ruốc', steps: 'Xương bò ngâm nước lạnh 3-4 tiếng.||STEP||Làm sa tế tôm.||STEP||Trần bắp bò và xương bò.||STEP||Ninh 3-4 tiếng.', cook_time: '4 tiếng', servings: '6', views: 39, category: 'main', cuisine: 'vietnam' },
      { id: 20, user_id: 5, title: 'Bánh cuốn (bằng chảo)', ingredients: '200g thịt heo xay, hành tây, cà rốt, nấm hương, nấm mèo', steps: 'Pha bột gạo với nước.||STEP||Xào nhân thịt với mộc nhĩ.||STEP||Tráng bánh trên chảo.||STEP||Cho nhân vào và cuốn lại.', cook_time: '1 tiếng', servings: '4', views: 33, category: 'snack', cuisine: 'vietnam' },
      { id: 21, user_id: 6, title: 'Mực Xào Sa Tế', ingredients: '3 cây nấm đùi gà, ớt bột, tương ớt, nước tương, dầu hào', steps: 'Rửa nấm, xắt theo chiều dọc.||STEP||Pha hỗn hợp sauce.||STEP||Phi tỏi thơm cho sauce vào nấu.', cook_time: '30 phút', servings: '2', views: 38, category: 'snack', cuisine: 'vietnam' },
      { id: 22, user_id: 6, title: 'Xôi Xéo', ingredients: '1kg gạo nếp, 200g đậu xanh lột vỏ, 100g hành tím, bột nghệ', steps: 'Gạo nếp ngâm với bột nghệ qua đêm.||STEP||Gạo nếp hấp 30 phút.||STEP||Múc xôi ra dĩa, phủ đậu xanh lên.', cook_time: '30 phút', servings: '6', views: 29, category: 'appetizer', cuisine: 'vietnam' },
      { id: 23, user_id: 6, title: 'Gà Xào Sả Ớt', ingredients: '500g thịt gà mái, 4 cây sả, ớt sừng, bột nghệ, nước mắm', steps: 'Gà rửa sạch chặt khúc, ướp gia vị.||STEP||Phi thơm tỏi sả ớt.||STEP||Thêm nước đậy nắp 10 phút.', cook_time: '45 phút', servings: '4', views: 47, category: 'main', cuisine: 'vietnam' },
      { id: 24, user_id: 6, title: 'Canh Bí Đỏ Tôm', ingredients: '300g tôm, 300ml nước, 250g bí đỏ, ngò, hành lá', steps: 'Ướp tôm với hạt nêm và hành tím.||STEP||Ướp hạt nêm vào bí đỏ.||STEP||Xào tôm, đổ nước, cho bí đỏ vào.', cook_time: '30 phút', servings: '2', views: 29, category: 'soup', cuisine: 'vietnam' },
      { id: 25, user_id: 6, title: 'Sườn Xào Chua Ngọt', ingredients: '300g sườn heo, 2 trái cà chua, 1/2 trái thơm, hành lá', steps: 'Sườn heo rửa sạch, trụng nước sôi.||STEP||Pha nước sốt.||STEP||Chiên sườn vàng, cho nước sốt vào.', cook_time: '45 phút', servings: '3', views: 53, category: 'main', cuisine: 'vietnam' },
      { id: 31, user_id: 1, title: 'Phở Bò Hà Nội', ingredients: '1kg thịt bò, 1kg xương lợn, sá sùng khô, quế, hoa hồi, thảo quả', steps: 'Rửa sạch xương bò, luộc qua.||STEP||Cho xương bò vào hầm 1h30.||STEP||Nướng chín hành, gừng.||STEP||Rang hoa hồi, quế.||STEP||Nấu sôi nước hầm bò.||STEP||Cắt lát mỏng thịt bò.', cook_time: '2 tiếng', servings: '6', views: 123, category: 'main', cuisine: 'vietnam' },
      { id: 32, user_id: 1, title: 'Cơm Tấm Sườn Nướng', ingredients: '2 miếng thịt cốt lếch, 2 quả trứng gà, dưa leo, sữa đặc', steps: 'Ướp thịt cốt lếch với sữa đặc, nước mắm.||STEP||Cắt nhỏ hành lá.||STEP||Rửa sạch dưa leo.||STEP||Chiên trứng ốp la.||STEP||Nướng thịt.||STEP||Sắp mọi thứ lên đĩa.', cook_time: '2 tiếng', servings: '2', views: 45, category: 'main', cuisine: 'vietnam' },
      { id: 33, user_id: 1, title: 'Bánh Mì Thịt Nướng', ingredients: 'bánh mì, đồ chua, thịt heo, xã băm, tỏi, ớt, cà chua', steps: 'Làm đồ chua.||STEP||Xay hỗn hợp tỏi, hành, xã.||STEP||Sốt ướp thịt nướng.||STEP||Ướp thịt.||STEP||Nướng thịt.||STEP||Làm nước mắm.||STEP||Cho vào bánh mì.', cook_time: '1 tiếng', servings: '2-3', views: 48, category: 'main', cuisine: 'vietnam' },
      { id: 34, user_id: 1, title: 'Bún Chả Hà Nội', ingredients: '1-1.3kg thịt heo, rau xà lách, cà rốt, đu đủ xanh, bún gạo', steps: 'Thịt heo băm nhuyễn, ướp gia vị.||STEP||Cà rốt, đu đủ bào mỏng ngâm chua.||STEP||Làm nước chấm.||STEP||Bày bún, rau, chả ra đĩa.', cook_time: '1 tiếng', servings: '5-6', views: 30, category: 'main', cuisine: 'vietnam' },
      { id: 35, user_id: 1, title: 'Gỏi Cuốn Tôm Thịt', ingredients: '700g thịt ba chỉ, 700g tôm tươi, bún tươi, rau xà lách', steps: 'Thịt rửa sạch, luộc chín.||STEP||Tôm bóc vỏ, luộc chín.||STEP||Các loại rau rửa sạch.||STEP||Làm ướt bánh tráng cuốn.', cook_time: '60 phút', servings: '4', views: 36, category: 'main', cuisine: 'vietnam' },
      { id: 38, user_id: 3, title: 'Bún đậu mắm tôm', ingredients: '300g lưỡi heo, 200g đậu khuôn, 300g bún khô, rau ăn kèm', steps: 'Bún khô luộc chín, ép lại thành bánh.||STEP||Đậu chiên vàng giòn.||STEP||Thịt luộc chín, cắt miếng.||STEP||Pha mắm tôm.', cook_time: '1 tiếng', servings: '4', views: 6, category: 'main', cuisine: 'vietnam' }
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
    
    // Import favorites (đầy đủ từ MySQL - chỉ dùng recipe IDs đã import)
    const favorites = [[1,33],[1,31],[1,32],[1,34],[1,35],[1,23],[1,13],[1,8],[1,17],[6,21],[6,22],[6,23],[6,24],[6,13],[6,32],[6,25],[6,20],[6,7],[4,11],[4,15],[4,12],[4,14],[4,13],[4,31],[4,21],[4,9],[4,19],[5,20],[5,19],[5,17],[5,18],[5,16],[5,31],[5,24],[5,14],[5,8],[3,6],[3,10],[3,9],[3,8],[3,7],[3,35],[3,25],[3,11],[3,18],[3,38],[2,31],[2,6],[2,16],[2,15],[2,25]];
    for (const [u, r] of favorites) {
      try { await db.pool.query(`INSERT INTO favorite (user_id, recipe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [u, r]); results.favorites++; } catch(e) {}
    }
    
    // Import ratings (đầy đủ từ MySQL)
    const ratings = [[33,2,5],[6,2,5],[33,1,4],[31,1,5],[32,1,5],[34,1,5],[35,1,5],[21,6,5],[11,4,5],[20,5,5],[19,5,5],[17,5,5],[18,5,5],[16,5,5],[6,3,5],[10,3,5],[9,3,5],[8,3,5],[7,3,5],[19,3,2],[31,2,5],[16,2,5],[15,2,5],[25,2,5],[22,6,5],[23,6,5],[24,6,5],[25,6,5],[12,6,4],[14,6,2],[13,6,3],[15,6,2],[15,4,5],[14,4,5],[12,4,5],[13,4,5],[11,6,4],[31,6,5],[31,4,5],[32,6,4],[33,6,1],[35,6,3],[34,6,2],[32,4,4],[35,4,2],[33,4,3],[34,4,1],[31,5,5],[31,3,1],[33,5,2],[35,3,5],[25,1,4],[21,1,3],[23,1,5],[22,1,2],[24,1,1],[15,1,4],[13,1,5],[11,1,2],[14,1,3],[12,1,1],[6,1,4],[7,1,2],[8,1,5],[9,1,1],[10,1,3],[16,1,4],[19,1,3],[17,1,5],[18,1,1],[20,1,2],[32,3,3],[33,3,4],[34,3,1],[25,3,5],[23,3,4],[21,3,2],[22,3,3],[24,3,1],[13,3,4],[15,3,3],[11,3,5],[14,3,1],[12,3,2],[16,3,3],[17,3,4],[18,3,5],[20,3,1],[6,6,3],[8,6,2],[9,6,1],[7,6,5],[20,6,5],[19,6,4],[18,6,3],[16,6,2],[17,6,1],[10,6,4],[25,4,4],[24,4,2],[22,4,1],[21,4,5],[23,4,3],[6,4,2],[8,4,4],[9,4,5],[10,4,1],[7,4,3],[19,4,5],[17,4,3],[16,4,2],[18,4,4],[20,4,1],[13,2,5],[24,2,5],[12,2,5],[34,2,5],[20,2,5],[22,2,5],[9,2,5],[14,2,5],[10,2,5],[18,2,5],[21,2,5],[7,2,5],[19,2,5],[8,2,5],[32,2,5],[32,5,1],[35,5,3],[34,5,4],[24,5,5],[22,5,4],[23,5,2],[25,5,1],[21,5,3],[14,5,5],[12,5,3],[11,5,4],[13,5,1],[15,5,2],[9,5,4],[10,5,2],[6,5,3],[7,5,1],[8,5,5],[38,3,5]];
    for (const [rec, usr, rat] of ratings) {
      try { await db.pool.query(`INSERT INTO danh_gia (recipe_id, user_id, rating) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [rec, usr, rat]); results.ratings++; } catch(e) {}
    }
    
    // Import comments (đầy đủ từ MySQL)
    const comments = [[8,1,'Nhìn ngon thế'],[8,4,'để nấu thử xem sao'],[8,6,'được á'],[8,2,'UKm'],[31,3,'Ăn được không'],[31,1,'Sao lại không nhỉ']];
    for (const [rec, usr, cmt] of comments) {
      try { await db.pool.query(`INSERT INTO binh_luan (recipe_id, user_id, comment) VALUES ($1, $2, $3)`, [rec, usr, cmt]); results.comments++; } catch(e) {}
    }
    
    // Import tags
    const tags = [[1,'Dễ làm','de-lam',8],[2,'Nhanh gọn','nhanh-gon',6],[3,'Healthy','healthy',1],[4,'Ít calo','it-calo',0],[5,'Chay','chay',0],[6,'Không gluten','khong-gluten',0],[7,'Cho trẻ em','cho-tre-em',6],[8,'Tiệc tùng','tiec-tung',4],[9,'Ngày lễ','ngay-le',3],[10,'Gia đình','gia-dinh',23]];
    for (const [id, name, slug, count] of tags) {
      try { await db.pool.query(`INSERT INTO tags (id, name, slug, usage_count) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`, [id, name, slug, count]); results.tags = (results.tags || 0) + 1; } catch(e) {}
    }
    await db.pool.query(`SELECT setval('tags_id_seq', (SELECT COALESCE(MAX(id), 1) FROM tags))`);
    
    // Import recipe_tags
    const recipeTags = [[33,1],[33,2],[34,10],[31,10],[35,10],[35,8],[35,2],[21,10],[21,2],[21,1],[22,10],[22,2],[22,1],[22,7],[22,3],[23,10],[24,10],[24,7],[25,10],[11,10],[11,2],[12,10],[12,9],[13,1],[13,2],[13,7],[14,7],[14,10],[15,1],[15,10],[16,10],[17,10],[18,8],[18,10],[18,7],[20,10],[20,7],[20,1],[19,10],[6,10],[7,8],[7,10],[7,9],[8,10],[8,8],[9,10],[9,1],[10,10],[10,9],[10,1],[38,10]];
    for (const [rec, tag] of recipeTags) {
      try { await db.pool.query(`INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [rec, tag]); results.recipeTags = (results.recipeTags || 0) + 1; } catch(e) {}
    }
    
    // Import comment_likes
    const commentLikes = [[3,4],[1,5],[1,6],[2,6],[1,2],[5,3]];
    for (const [cmt, usr] of commentLikes) {
      try { await db.pool.query(`INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [cmt, usr]); results.commentLikes = (results.commentLikes || 0) + 1; } catch(e) {}
    }
    
    // Import broadcast_notifications
    try { 
      await db.pool.query(`INSERT INTO broadcast_notifications (id, sender_id, message, image_url) VALUES (1, 2, 'Sáng mai Update', NULL) ON CONFLICT DO NOTHING`);
      results.broadcasts = 1;
    } catch(e) {}
    await db.pool.query(`SELECT setval('broadcast_notifications_id_seq', (SELECT COALESCE(MAX(id), 1) FROM broadcast_notifications))`);
    
    // Import bao_cao (reports) - quan trọng cho demo
    const reports = [
      [1, 8, 1, 'spam', 'rejected', 'test', 'recipe', null, null],
      [2, 11, 1, 'test', 'accepted', null, 'recipe', null, null],
      [3, 19, 1, 'test', 'pending', null, 'recipe', null, null],
      [4, 33, 5, 'test', 'pending', null, 'recipe', null, null],
      [5, 14, 1, 'spam', 'pending', null, 'recipe', null, null],
      [6, 11, 5, 'test', 'pending', null, 'recipe', null, null]
    ];
    for (const [id, rec, usr, reason, status, rejected, target, cmt, reported] of reports) {
      try { 
        await db.pool.query(`INSERT INTO bao_cao (id, recipe_id, user_id, reason, status, rejected_reason, target_type, comment_id, reported_user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`, [id, rec, usr, reason, status, rejected, target, cmt, reported]); 
        results.reports = (results.reports || 0) + 1; 
      } catch(e) {}
    }
    await db.pool.query(`SELECT setval('bao_cao_id_seq', (SELECT COALESCE(MAX(id), 1) FROM bao_cao))`);
    
    // Import user_report_quota
    const quotas = [[1, 2, 'comment', 1], [2, 1, 'user', 3], [3, 2, 'user', 3], [4, 7, 'user', 3]];
    for (const [id, usr, type, remaining] of quotas) {
      try { 
        await db.pool.query(`INSERT INTO user_report_quota (id, user_id, report_type, remaining_reports) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`, [id, usr, type, remaining]); 
        results.quotas = (results.quotas || 0) + 1; 
      } catch(e) {}
    }
    await db.pool.query(`SELECT setval('user_report_quota_id_seq', (SELECT COALESCE(MAX(id), 1) FROM user_report_quota))`);
    
    // Import user_theme_preferences
    try {
      await db.pool.query(`INSERT INTO user_theme_preferences (id, user_id, theme_data) VALUES (1, 1, '{"primary_color":"#ff7f50","theme_name":"Custom Theme"}') ON CONFLICT DO NOTHING`);
      results.themes = 1;
    } catch(e) {}
    await db.pool.query(`SELECT setval('user_theme_preferences_id_seq', (SELECT COALESCE(MAX(id), 1) FROM user_theme_preferences))`);
    
    // Import notifications (bỏ image_url vì là localhost)
    const notifications = [
      [1, 2, 5, 'admin', 'report_warning', 'Bạn nhận được một cảnh báo về bài viết "Bún Bò Huế"'],
      [2, 5, 2, 'user', 'reply', 'Test'],
      [3, 5, 2, 'user', 'reply', 'test'],
      [4, 2, 1, 'admin', 'report_warning', 'Bạn nhận được một cảnh báo về bài viết "Bánh Mì Thịt Nướng"'],
      [5, 1, 2, 'moderator', 'reply', 'test'],
      [6, 5, 2, 'user', 'reply', 'Test'],
      [7, 3, 4, 'moderator', 'report_warning', 'Bạn nhận được một cảnh báo về bài viết "Mì Xào Hải Sản"']
    ];
    for (const [id, sender, receiver, role, type, msg] of notifications) {
      try { 
        await db.pool.query(`INSERT INTO notifications (id, sender_id, receiver_id, sender_role, type, message) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`, [id, sender, receiver, role, type, msg]); 
        results.notifications = (results.notifications || 0) + 1; 
      } catch(e) {}
    }
    await db.pool.query(`SELECT setval('notifications_id_seq', (SELECT COALESCE(MAX(id), 1) FROM notifications))`);
    
    // Import admin_hidden_recipes
    try {
      await db.pool.query(`INSERT INTO admin_hidden_recipes (id, recipe_id, hidden_by, reason) VALUES (1, 25, 2, 'Test') ON CONFLICT DO NOTHING`);
      results.hiddenRecipes = 1;
    } catch(e) {}
    await db.pool.query(`SELECT setval('admin_hidden_recipes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM admin_hidden_recipes))`);
    
    // step_images: KHÔNG import vì ảnh localhost không tồn tại trên Render
    // Bạn có thể upload ảnh mới cho từng bước trên web sau
    results.stepImages = 0;
    
    // Import recipe_views (sample data)
    const recipeViews = [
      [24,'::1'],[19,'::1'],[8,'::1'],[31,'::1'],[32,'::1'],[33,'::1'],[34,'::1'],[35,'::1'],
      [6,'::1'],[7,'::1'],[9,'::1'],[10,'::1'],[11,'::1'],[12,'::1'],[13,'::1'],[14,'::1'],
      [15,'::1'],[16,'::1'],[17,'::1'],[18,'::1'],[20,'::1'],[21,'::1'],[22,'::1'],[23,'::1'],[25,'::1'],[38,'::1']
    ];
    for (const [recId, ip] of recipeViews) {
      try { 
        await db.pool.query(`INSERT INTO recipe_views (recipe_id, client_ip) VALUES ($1, $2)`, [recId, ip]); 
        results.recipeViews = (results.recipeViews || 0) + 1; 
      } catch(e) {}
    }
    
    res.json({ success: true, message: 'Import FULL hoàn tất! Tất cả dữ liệu đã sẵn sàng cho demo.', results });
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
