const express = require("express");
const cors = require("cors");
const path = require("path");
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
require("./config/db");

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

// ✅ Scheduled Tasks - chạy mỗi giờ
const scheduledTasks = require("./scripts/scheduled_tasks");

// Chạy ngay khi server khởi động
setTimeout(() => {
  scheduledTasks.runAllTasks();
}, 5000);

// Chạy mỗi giờ
setInterval(() => {
  scheduledTasks.runAllTasks();
}, 60 * 60 * 1000); // 1 giờ

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend đang chạy tại port ${PORT}`);
});
