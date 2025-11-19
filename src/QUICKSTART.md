# ⚡ QUICK START GUIDE

## 🚀 Bắt Đầu Nhanh (5 Phút)

### 1. Setup Database
```bash
mysql -u root -p cooking_app < database.sql
```

### 2. Run Backend
```bash
cd backend
npm install
node server.js
# ✅ http://localhost:3001
```

### 3. Run Frontend
```bash
cd cookshare
npm install
npm start
# ✅ http://localhost:3000
```

### 4. Đăng Nhập
- Email: `admin@cooking.com`
- Password: `admin123`

---

## 📝 Các Tính Năng

### 👤 User
- ✅ Đăng ký/Đăng nhập
- ✅ Tạo công thức
- ✅ Sửa/Xóa công thức
- ✅ Bình luận
- ✅ Đánh giá (⭐)
- ✅ Yêu thích (❤️)
- ✅ Tìm kiếm

### 🛡️ Admin
- ✅ Xem tất cả công thức
- ✅ Xem tất cả users
- ✅ Xóa công thức
- ✅ Xóa users
- ✅ Dashboard stats

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT, Bcrypt |
| Images | Cloudinary |

---

## 🐛 Xử Lý Lỗi Nhanh

| Lỗi | Giải Pháp |
|-----|----------|
| MySQL không kết nối | Kiểm tra MySQL chạy `mysql -u root -p` |
| CORS error | Kiểm tra backend `.env` |
| Image upload fail | Cập nhật Cloudinary API keys |
| 404 Not Found | Kiểm tra port 3001 & 3000 |

---

## 📱 API Chính

```bash
# Auth
POST /auth/login
POST /auth/register

# Recipes
GET  /recipe/list
GET  /recipe/search?q=hello
POST /recipe/create
PUT  /recipe/update/:id
DELETE /recipe/delete/:id

# Ratings
POST /rating/:id
GET  /rating/stats/:id

# Favorites
POST /favorite/:id
DELETE /favorite/:id

# Admin
GET  /admin/recipes
DELETE /admin/delete/:id
```

---

## 🎨 Features Showcase

### Home
- 🔍 Search bar
- 📋 Recipe grid
- 📱 Responsive

### Detail
- ⭐ Rating system
- 💬 Comments
- ❤️ Favorites

### Admin
- 📊 Dashboard
- 👥 Users management
- 📖 Recipes management

---

## 📚 Docs

- `README.md` - Full documentation
- `SETUP.md` - Detailed setup
- `CHANGELOG.md` - Changes list
- `database.sql` - DB schema

---

**✨ Happy Coding! 🚀**
