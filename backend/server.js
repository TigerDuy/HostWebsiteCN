const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files so local fallback images are accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Kết nối database (db.js đã tạo connection)
require("./config/db");

// ✅ Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const recipeRoutes = require("./routes/recipe");
app.use("/recipe", recipeRoutes);

const debugRoutes = require('./routes/debug');
app.use('/', debugRoutes);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

// ✅ Thêm route yêu thích (Favorite)
const favoriteRoutes = require("./routes/favorite");
app.use("/favorite", favoriteRoutes);

// ✅ Thêm route đánh giá (Rating)
const ratingRoutes = require("./routes/rating");
app.use("/rating", ratingRoutes);

// ✅ Start server
app.listen(3001, () => {
  console.log("✅ Backend đang chạy tại http://localhost:3001");
});
