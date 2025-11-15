# 🍳 CookShare - Website Chia Sẻ Công Thức Nấu Ăn

Một website hiện đại để chia sẻ, tìm kiếm và đánh giá các công thức nấu ăn, lấy cảm hứng từ **Cookpad**.

## 🌟 Tính Năng

### ✅ Đã Hoàn Thiện

#### **Xác Thực & Người Dùng**
- ✅ Đăng ký tài khoản với validation
- ✅ Đăng nhập với JWT token
- ✅ Đăng xuất
- ✅ Phân quyền Admin

#### **Công Thức Nấu Ăn**
- ✅ Tạo công thức (tiêu đề, nguyên liệu, cách làm, ảnh)
- ✅ Xem danh sách công thức
- ✅ Xem chi tiết công thức
- ✅ Sửa công thức (chỉ tác giả)
- ✅ Xóa công thức (chỉ tác giả)
- ✅ Upload ảnh với Cloudinary

#### **Tìm Kiếm & Lọc**
- ✅ Tìm kiếm công thức theo tiêu đề
- ✅ Trang kết quả tìm kiếm

#### **Tương Tác**
- ✅ Bình luận công thức
- ✅ Đánh giá công thức (1-5 sao)
- ✅ Xem thống kê đánh giá (biểu đồ)
- ✅ Yêu thích công thức

#### **Quản Trị Admin**
- ✅ Xem danh sách công thức
- ✅ Xem danh sách người dùng
- ✅ Xóa công thức
- ✅ Xóa người dùng
- ✅ Dashboard với thống kê

#### **Giao Diện**
- ✅ Responsive design (PC, tablet, mobile)
- ✅ UI hiện đại và dễ sử dụng
- ✅ Gradient colors và animations

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router v7** - Routing
- **Axios** - API requests
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image upload

---

## 📦 Cài Đặt

### 1. Clone Repository
```bash
git clone <repository>
cd DuAn
```

### 2. Cài Đặt Backend

```bash
cd backend
npm install
```

**Tạo file `.env`:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cooking_app
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Tạo Database:**
```bash
mysql -u root -p < database.sql
```

**Chạy Backend:**
```bash
npm start
# Server chạy tại http://localhost:3001
```

### 3. Cài Đặt Frontend

```bash
cd cookshare
npm install
npm start
# App chạy tại http://localhost:3000
```

---

## 📝 API Documentation

### Authentication
```
POST /auth/register         - Đăng ký
POST /auth/login            - Đăng nhập
```

### Recipes
```
GET  /recipe/list           - Danh sách công thức
GET  /recipe/detail/:id     - Chi tiết công thức
POST /recipe/create         - Tạo công thức
PUT  /recipe/update/:id     - Cập nhật công thức
DELETE /recipe/delete/:id   - Xóa công thức
GET  /recipe/search?q=      - Tìm kiếm
GET  /recipe/my             - Công thức của tôi
```

### Comments
```
POST /recipe/comment        - Thêm bình luận
GET  /recipe/comment/:id    - Danh sách bình luận
```

### Favorites
```
POST /favorite/:id          - Thêm yêu thích
DELETE /favorite/:id        - Xóa yêu thích
GET  /favorite/list         - Danh sách yêu thích
GET  /favorite/check/:id    - Kiểm tra yêu thích
```

### Ratings
```
POST /rating/:id            - Đánh giá
GET  /rating/:id            - Danh sách đánh giá
GET  /rating/stats/:id      - Thống kê đánh giá
GET  /rating/user/:id       - Đánh giá của user
```

### Admin
```
GET  /admin/recipes         - Danh sách công thức
GET  /admin/users           - Danh sách người dùng
DELETE /admin/delete/:id    - Xóa công thức
DELETE /admin/user/:id      - Xóa người dùng
```

---

## 👥 Tài Khoản Test

### Admin
- Email: `admin@cooking.com`
- Password: `admin123`

### User
- Email: `user@cooking.com`
- Password: `user123`

---

## 📁 Cấu Trúc Project

```
DuAn/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── recipe.js
│   │   ├── favorite.js
│   │   ├── rating.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── cookshare/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Navbar.css
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CreateRecipe.jsx
│   │   │   ├── MyRecipes.jsx
│   │   │   ├── RecipeDetail.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Search.jsx
│   │   │   └── *.css
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   └── package.json
│
└── database.sql
```

---

## 🚀 Tính Năng Nâng Cao (Có thể thêm)

- [ ] Follow người dùng
- [ ] Like bình luận
- [ ] Danh sách yêu thích (Favorites)
- [ ] Lọc theo danh mục
- [ ] Tạo collection công thức
- [ ] Chia sẻ công thức qua mạng xã hội
- [ ] Thông báo (notifications)
- [ ] Chat giữa users
- [ ] Điều chỉnh ngôn ngữ
- [ ] Mode tối/sáng

---

## 🎨 Màu Sắc & Style

- **Primary Color**: `#ff7f50` (Cam)
- **Secondary Color**: `#ff6347` (Đỏ cam)
- **Background**: `#f9f9f9` (Xám nhẹ)
- **Text**: `#333` (Đen)

---

## 📝 Ghi Chú

- Tất cả mật khẩu được mã hóa bằng **bcrypt**
- JWT token hết hạn sau **7 ngày**
- Ảnh được upload lên **Cloudinary**
- Database sử dụng **MySQL**

---

## 🤝 Hỗ Trợ

Nếu có vấn đề, vui lòng:
1. Kiểm tra backend chạy tại `http://localhost:3001`
2. Kiểm tra database đã được tạo
3. Kiểm tra Cloudinary config
4. Xem console log để tìm lỗi

---

## 📄 License

MIT License - Sử dụng tự do

---

**Happy Cooking! 🍳👨‍🍳**
