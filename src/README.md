#  CookShare - Website Chia Sẻ Công Thức Nấu Ăn

Một website hiện đại để chia sẻ, tìm kiếm và đánh giá các công thức nấu ăn, lấy cảm hứng từ **Cookpad**.

##  Tính Năng

###  Đã Hoàn Thiện

#### **Xác Thực & Người Dùng**
-  Đăng ký tài khoản với validation
-  Đăng nhập với JWT token
-  Đăng xuất
-  Phân quyền Admin

#### **Công Thức Nấu Ăn**
-  Tạo công thức (tiêu đề, nguyên liệu, cách làm, ảnh)
-  Xem danh sách công thức
-  Xem chi tiết công thức
-  Sửa công thức (chỉ tác giả)
-  Xóa công thức (chỉ tác giả)
-  Upload ảnh với Cloudinary
-  Upload ảnh từng bước của công thức
-  Hiển thị ảnh từng bước trong cách làm
-  Đếm lượt xem công thức (chặn spam 1 view/IP/1 phút)

#### **Tìm Kiếm & Lọc**
-  Tìm kiếm công thức theo tiêu đề
-  Trang kết quả tìm kiếm

#### **Tương Tác**
-  Bình luận công thức
-  Trả lời bình luận (nested comments)
-  Sửa/xóa bình luận
-  Thích bình luận (like/unlike)
-  Sắp xếp bình luận (mới nhất, cũ nhất, được thích nhiều nhất)
-  Đánh giá công thức (1-5 sao)
-  Xem thống kê đánh giá (biểu đồ)
-  Yêu thích công thức
-  Theo dõi người dùng (follow/unfollow)
-  Đếm lượt xem công thức
-  Trang cá nhân người dùng
-  Upload/cập nhật avatar

#### **Quản Trị Admin**
-  Xem danh sách công thức
-  Xem danh sách người dùng
-  Xóa công thức
-  Xóa người dùng
-  Dashboard với thống kê
-  Xem & xử lý báo cáo (report system)
-  Hệ thống thông báo (notifications)
-  Tùy chỉnh giao diện (theme customization)
-  Chia sẻ theme với cộng đồng
-  Broadcast thông báo đến tất cả users
-  Quản lý nội quy cộng đồng

#### **Giao Diện**
-  Responsive design (PC, tablet, mobile)
-  UI hiện đại và dễ sử dụng
-  Gradient colors và animations
-  Tùy chỉnh giao diện (chọn màu chủ đạo, ảnh nền)
-  Chia sẻ theme (export/import JSON)
-  Thị trường theme công khai
-  Dark mode support
-  Image Lightbox (zoom ảnh)
-  Trang nội quy cộng đồng

---

##  Tech Stack

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
- **@hello-pangea/dnd** - Drag and drop (ingredients, steps)

---

##  Cài Đặt

### 1. Clone Repository
```bash
git clone https://github.com/TigerDuy/cn_da22ttd_nguyenthanhduy_110122062_xaydungwebsitechiasecongthucnauan.git
cd cn_da22ttd_nguyenthanhduy_110122062_xaydungwebsitechiasecongthucnauan
cd src
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

##  API Documentation

### Authentication
```
POST /auth/register         - Đăng ký
POST /auth/login            - Đăng nhập
```

### Recipes
```
GET  /recipe/list                          - Danh sách công thức
GET  /recipe/detail/:id                    - Chi tiết công thức
POST /recipe/create                        - Tạo công thức
PUT  /recipe/update/:id                    - Cập nhật công thức
DELETE /recipe/delete/:id                  - Xóa công thức
POST /recipe/upload-step-images/:id        - Upload ảnh từng bước
DELETE /recipe/delete-step-image/:id/:imageId - Xóa ảnh bước
GET  /recipe/search?q=                     - Tìm kiếm
GET  /recipe/my                            - Công thức của tôi
POST /recipe/view/:id                      - Đếm view (chống spam IP)
```

### Comments
```
POST /recipe/comment           - Thêm bình luận (hỗ trợ parent_id cho reply)
GET  /recipe/comment/:id       - Danh sách bình luận (hỗ trợ sort: latest/oldest/top)
PUT  /recipe/comment/:id       - Cập nhật bình luận
DELETE /recipe/comment/:id     - Xóa bình luận
POST /recipe/comment/:id/like  - Like/unlike bình luận
```

### Follow
```
POST /follow/:userId           - Theo dõi người dùng
DELETE /follow/:userId         - Hủy theo dõi
GET  /follow/is-following/:id  - Kiểm tra trạng thái theo dõi
GET  /follow/followers         - Danh sách người theo dõi
GET  /follow/following         - Danh sách đang theo dõi
```

### User Profile
```
GET  /auth/profile/:id         - Xem profile người dùng
POST /auth/upload-avatar       - Upload avatar
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
GET  /admin/reports         - Danh sách báo cáo
```

### Report System
```
POST /report/create         - Tạo báo cáo (recipe_id, reason, description)
GET  /admin/reports         - Danh sách báo cáo (admin only)
PUT  /report/:id            - Xử lý báo cáo (admin only, status: processing/resolved)
```

### Notifications
```
GET  /notification/list              - Danh sách thông báo
POST /notification/mark-read/:id     - Đánh dấu đã đọc
POST /notification/mark-all-read     - Đánh dấu tất cả đã đọc
POST /notification/broadcast         - Gửi thông báo broadcast (admin)
```

### Rules (Nội quy)
```
GET  /rules                          - Lấy nội quy
PUT  /rules                          - Cập nhật nội quy (admin)
```

### Theme
```
GET  /theme/preferences     - Lấy theme preferences
POST /theme/preferences     - Lưu theme preferences
GET  /theme/export          - Export theme JSON
POST /theme/share           - Chia sẻ theme công khai
GET  /theme/marketplace     - Danh sách theme chia sẻ
```

---

##  Tài Khoản Test

### Admin
- Email: `	admin@gmail.com`
- Password: `123456`

### User
- Email: `test@gmail.com`
- Password: `123456`

---

##  Cấu Trúc Project

```
DoAnChuyenNganh/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── recipe.js
│   │   ├── favorite.js
│   │   ├── rating.js
│   │   ├── admin.js
│   │   ├── follow.js
│   │   ├── theme.js
│   │   ├── report.js
│   │   ├── notification.js
│   │   └── rules.js
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
│   │   │   ├── Navbar.css
│   │   │   ├── Footer.jsx
│   │   │   ├── Footer.css
│   │   │   ├── ImageLightbox.jsx
│   │   │   ├── ImageLightbox.css
│   │   │   ├── ReportButton.jsx
│   │   │   ├── BroadcastNotification.jsx
│   │   │   ├── RulesModal.jsx
│   │   │   └── RoleChecker.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CreateRecipe.jsx
│   │   │   ├── MyRecipes.jsx
│   │   │   ├── RecipeDetail.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminReports.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── Favorites.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── ThemeCustomization.jsx
│   │   │   ├── ThemeMarketplace.jsx
│   │   │   ├── Rules.jsx
│   │   │   └── *.css
│   │   ├── hooks/
│   │   │   └── useRoleChecker.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   └── package.json
│
└── database.sql
```

---

##  Tính Năng Nâng Cao

- [x] Follow người dùng
- [x] Like bình luận
- [x] Danh sách yêu thích (Favorites)
- [x] Bình luận lồng nhau (nested comments)
- [x] Trang cá nhân người dùng
- [x] Ảnh từng bước của công thức
- [x] Tùy chỉnh giao diện (theme customization)
- [x] Chia sẻ theme (export/import JSON)
- [x] Thị trường theme công khai
- [x] View counter với spam protection
- [x] Thông báo (notifications)
- [x] Hệ thống báo cáo (report system)
- [x] Broadcast thông báo từ admin
- [x] Trang nội quy cộng đồng
- [x] Image Lightbox component
- [x] Role checker (kiểm tra quyền admin)
- [ ] Lọc theo danh mục
- [ ] Tạo collection công thức
- [ ] Chia sẻ công thức qua mạng xã hội
- [ ] Chat giữa users
- [ ] Điều chỉnh ngôn ngữ

---

##  Màu Sắc & Style

- **Primary Color**: `#ff7f50` (Cam)
- **Secondary Color**: `#ff6347` (Đỏ cam)
- **Background**: `#f9f9f9` (Xám nhẹ)
- **Text**: `#333` (Đen)

---

##  Ghi Chú

- Tất cả mật khẩu được mã hóa bằng **bcrypt**
- JWT token hết hạn sau **7 ngày**
- Ảnh được upload lên **Cloudinary** hoặc lưu **local**
- Database sử dụng **MySQL**
- View count chặn spam: **1 view/IP/1 phút**
- Theme được lưu trên **server** (user_theme_preferences table)
- Hỗ trợ **drag & drop** sắp xếp nguyên liệu và bước làm
- Body size limit: **50MB** cho base64 images

---

##  Hỗ Trợ

Nếu có vấn đề, vui lòng:
1. Kiểm tra backend chạy tại `http://localhost:3001`
2. Kiểm tra database đã được tạo
3. Kiểm tra Cloudinary config
4. Xem console log để tìm lỗi

---

##  License

MIT License - Sử dụng tự do

---

**Happy Cooking! **


