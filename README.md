# 🍳 CookShare - Website Chia Sẻ Công Thức Nấu Ăn

Một website hiện đại để chia sẻ, tìm kiếm và đánh giá các công thức nấu ăn, lấy cảm hứng từ **Cookpad**.

## 🌐 Demo

**🔗 Website: [https://cookshare-sgci.onrender.com/](https://cookshare-sgci.onrender.com/)**

## ✨ Tính Năng

### ✅ Đã Hoàn Thiện

#### **Xác Thực & Người Dùng**
- ✅ Đăng ký tài khoản với validation
- ✅ Đăng nhập với JWT token (hết hạn 7 ngày)
- ✅ Đăng xuất
- ✅ Phân quyền User/Moderator/Admin

#### **Công Thức Nấu Ăn**
- ✅ Tạo công thức (tiêu đề, nguyên liệu, cách làm, ảnh)
- ✅ Xem danh sách công thức với phân trang
- ✅ Lọc theo category, cuisine, tags
- ✅ Xem chi tiết công thức
- ✅ Sửa công thức (chỉ tác giả)
- ✅ Xóa công thức (tác giả hoặc moderator/admin)
- ✅ Upload ảnh với Cloudinary
- ✅ Upload ảnh từng bước của công thức
- ✅ Đếm lượt xem công thức (chặn spam 1 view/IP/1 phút)
- ✅ Chia sẻ công thức (Web Share API)

#### **Tìm Kiếm & Lọc**
- ✅ Tìm kiếm công thức theo tiêu đề
- ✅ Lọc theo danh mục (category)
- ✅ Lọc theo ẩm thực (cuisine)
- ✅ Lọc theo tags
- ✅ Phân trang kết quả

#### **Tương Tác**
- ✅ Bình luận công thức
- ✅ Trả lời bình luận (nested comments)
- ✅ Sửa/xóa bình luận
- ✅ Đánh giá công thức (1-5 sao)
- ✅ Xem thống kê đánh giá (biểu đồ)
- ✅ Yêu thích công thức
- ✅ Theo dõi người dùng (follow/unfollow)
- ✅ Xem danh sách followers/following

#### **Hệ Thống Báo Cáo**
- ✅ Báo cáo bài viết vi phạm
- ✅ Báo cáo bình luận vi phạm
- ✅ Báo cáo người dùng vi phạm
- ✅ Upload ảnh bằng chứng
- ✅ Quota system (3 lượt/loại)
- ✅ Tự động khóa tính năng khi vi phạm nhiều

#### **Thông Báo**
- ✅ Thông báo cá nhân
- ✅ Broadcast thông báo từ admin
- ✅ Đánh dấu đã đọc/chưa đọc
- ✅ Badge đếm thông báo chưa đọc

#### **Quản Trị**
- ✅ Dashboard với thống kê
- ✅ Quản lý người dùng (xem, đổi role, xóa)
- ✅ Xử lý báo cáo (accept/reject)
- ✅ Ẩn bài viết vi phạm
- ✅ Gửi thông báo đến user
- ✅ Broadcast thông báo

#### **Giao Diện**
- ✅ Responsive design (PC, tablet, mobile)
- ✅ UI hiện đại và dễ sử dụng
- ✅ Tùy chỉnh giao diện (theme)
- ✅ Scroll to top button
- ✅ Image Lightbox (zoom ảnh)

---

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **React Router v7** - Routing
- **Axios** - API requests
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL 8.0** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image upload
- **Nodemailer** - Email notifications

### Hosting
- **Frontend**: Render (Static Site)
- **Backend**: Render (Web Service)
- **Database**: Clever Cloud (MySQL)

---

## 📦 Cài Đặt Local

### 1. Clone Repository
```bash
git clone https://github.com/TigerDuy/cn_da22ttd_nguyenthanhduy_110122062_xaydungwebsitechiasecongthucnauan.git
cd cn_da22ttd_nguyenthanhduy_110122062_xaydungwebsitechiasecongthucnauan/src
```

### 2. Cài Đặt Backend

```bash
cd backend
npm install
```

**Tạo file `.env`:**
```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cookingdb
SECRET_KEY=your-jwt-secret-key
JWT_SECRET=your-jwt-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Tạo Database:**
```bash
mysql -u root -p < database/database.sql
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
```

**Tạo file `.env`:**
```
REACT_APP_API_BASE=http://localhost:3001
```

**Chạy Frontend:**
```bash
npm start
# App chạy tại http://localhost:3000
```

---

## 🔑 Tài Khoản Test

### Admin
- Email: `admin@gmail.com`
- Password: `123456`

### User
- Email: `test@gmail.com`
- Password: `123456`

---

## 📊 Database Schema

Hệ thống sử dụng 13 bảng chính:

| Bảng | Mô tả |
|------|-------|
| nguoi_dung | Thông tin người dùng |
| cong_thuc | Công thức nấu ăn |
| binh_luan | Bình luận |
| danh_gia | Đánh giá sao |
| favorite | Yêu thích |
| follow | Theo dõi |
| step_images | Ảnh các bước |
| recipe_views | Theo dõi lượt xem |
| bao_cao | Báo cáo vi phạm |
| user_report_quota | Quota báo cáo |
| notifications | Thông báo |
| broadcast_notifications | Thông báo hàng loạt |
| user_theme_preferences | Tùy chỉnh giao diện |

---

## 📁 Cấu Trúc Project

```
src/
├── backend/
│   ├── config/          # Database, Cloudinary, Mailer config
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── uploads/         # Local uploads
│   └── server.js        # Entry point
│
├── cookshare/
│   ├── public/
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Page components
│       └── App.js       # Main app
│
└── database/
    └── database.sql     # Database schema
```

---

## 🎨 Màu Sắc & Style

- **Primary Color**: `#ff7f50` (Cam)
- **Secondary Color**: `#ff6347` (Đỏ cam)
- **Background**: `#f9f9f9` (Xám nhẹ)
- **Text**: `#333` (Đen)

---

## 📝 Ghi Chú

- Mật khẩu được mã hóa bằng **bcrypt**
- JWT token hết hạn sau **7 ngày**
- Ảnh được upload lên **Cloudinary**
- View count chặn spam: **1 view/IP/1 phút**
- Quota báo cáo: **3 lượt/loại**, hoàn lại khi xử lý

---

## 📄 License

MIT License - Sử dụng tự do

---

## 👨‍💻 Tác Giả

**Nguyễn Thành Duy** - MSSV: 110122062

Đồ án chuyên ngành - Lớp DA22TTD

---

**Happy Cooking! 🍳**
