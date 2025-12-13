const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Tăng giới hạn cho base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// ✅ Start server
app.listen(3001, () => {
  console.log("✅ Backend đang chạy tại http://localhost:3001");
});
