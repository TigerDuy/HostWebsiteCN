# 🍳 CookShare - Hướng Dẫn Bắt Đầu

## ⚡ Quick Start (5 phút)

### 1. Khởi Động Backend
```bash
cd src/backend
npm install
npm start
# ✅ Server chạy tại http://localhost:3001
```

### 2. Khởi Động Frontend
```bash
cd src/cookshare
npm install
npm start
# ✅ App chạy tại http://localhost:3000
```

### 3. Đăng Nhập
- **Admin**: `admin@gmail.com` / `123456`
- **User**: `test@gmail.com` / `123456`

---

## 🎯 Các Tính Năng Chính

### 📖 Công Thức (Recipes)
✅ Tạo công thức mới
✅ Thêm nguyên liệu (drag & drop)
✅ Thêm cách làm (drag & drop + ảnh từng bước)
✅ Upload ảnh bìa
✅ Xem danh sách công thức
✅ Xem chi tiết + ảnh từng bước
✅ Sửa công thức (hiển thị ảnh từng bước)
✅ Xóa công thức
✅ Đếm view (chống spam 1 IP/1 phút)

### 💬 Bình Luận
✅ Thêm bình luận
✅ Trả lời bình luận (nested)
✅ Like bình luận
✅ Sửa/xóa bình luận
✅ Sắp xếp (mới nhất, cũ nhất, thích nhiều)

### ⭐ Đánh Giá
✅ Đánh giá 1-5 sao
✅ Xem thống kê đánh giá

### ❤️ Yêu Thích
✅ Thêm/xóa yêu thích
✅ Xem danh sách yêu thích

### 👤 Theo Dõi
✅ Follow/unfollow người dùng
✅ Xem profile người dùng
✅ Upload avatar

### 🎨 Tùy Chỉnh Giao Diện
✅ Chọn màu chủ đạo
✅ Chọn ảnh nền
✅ Export theme (JSON)
✅ Import theme (JSON)
✅ Chia sẻ theme công khai
✅ Thị trường theme (xem & áp dụng theme người khác)
✅ Dark mode support

### 🔐 Admin Dashboard
✅ Xem danh sách công thức
✅ Xem danh sách người dùng
✅ Xóa công thức
✅ Xóa người dùng

### 🔍 Tìm Kiếm
✅ Tìm công thức theo tiêu đề
✅ Sắp xếp theo đánh giá

---

## 🛠️ Cấu Hình

### Backend `.env`
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=cookingdb
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Frontend `.env`
```env
REACT_APP_API_BASE=http://localhost:3001
```

---

## 📊 Database Tables

```
✅ users                          - Người dùng
✅ cong_thuc                      - Công thức
✅ step_images                    - Ảnh từng bước
✅ danh_gia                       - Đánh giá
✅ favorite                       - Yêu thích
✅ comment                        - Bình luận
✅ follow                         - Theo dõi
✅ recipe_views                   - Lượt xem + chống spam
✅ user_theme_preferences         - Cài đặt theme
```

---

## 🎓 Hướng Dẫn Sử Dụng

### Tạo Công Thức Mới
1. Click **"Tạo công thức"** (navbar)
2. Nhập **tiêu đề**
3. Thêm **nguyên liệu** (click `+ Nguyên liệu`)
   - Có thể **drag & drop** để sắp xếp
   - Nhập **khẩu phần** (số người)
4. Thêm **cách làm** (click `+ Bước làm`)
   - Nhập mô tả bước
   - Click **📷** để thêm hình ảnh từng bước
   - Có thể thêm **nhiều hình** cho 1 bước
   - **Drag & drop** để sắp xếp bước
5. Upload **ảnh bìa** (ảnh đại diện công thức)
6. Click **"Đăng bài"** để lưu

### Chỉnh Sửa Công Thức
1. Vào **công thức của tôi**
2. Click **nút sửa**
3. **Hình ảnh từng bước sẽ hiển thị**
   - Xóa hình cũ: click **×**
   - Thêm hình mới: click **📷**
4. Sửa text / thêm bước mới
5. Click **"Đăng bài"** để lưu

### Tùy Chỉnh Giao Diện
1. Click **menu người dùng** (navbar phải)
2. Click **"🎨 Tùy chỉnh giao diện"**
3. **Chọn màu** chủ đạo
4. **Chọn ảnh nền** (nếu cần)
5. **Lưu cài đặt** hoặc **chia sẻ**

### Chia Sẻ Theme
1. Tùy chỉnh giao diện xong
2. Click **"🌐 Chia Sẻ Theme"**
3. Nhập tên theme
4. Click **"✅ Chia Sẻ"**
5. Người khác sẽ thấy trong **"🌐 Thị trường theme"**

### Xem Thị Trường Theme
1. Click **menu người dùng** (navbar)
2. Click **"🌐 Thị trường theme"**
3. Xem các theme chia sẻ
4. Click **"✅ Áp Dụng"** để dùng
5. Hoặc click **"📥 Tải JSON"** để tải về

---

## 🐛 Troubleshooting

### Backend không khởi động
```bash
# Check port 3001 có bị chiếm không
netstat -ano | findstr :3001

# Check database connection
# Sửa .env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
```

### Frontend lỗi API
```bash
# Check backend chạy tại http://localhost:3001
# Check CORS error trong console
# Restart backend + frontend
```

### Ảnh không upload
```bash
# Check Cloudinary config (.env)
# Hoặc dùng local uploads: src/backend/uploads/
# Restart backend: npm start
```

### Lỗi "Payload Too Large" khi lưu theme
✅ **Đã sửa**: Giới hạn 50MB trong server.js
- Ảnh nền dùng base64 → phải nén ảnh
- Hoặc upload ảnh nhỏ < 100KB

### View counter không chạy
- Check `/recipe/view/:id` endpoint
- Database `recipe_views` table có được tạo không?
- Chạy script: `node scripts/create_recipe_views_table.js`

### Hình ảnh từng bước không hiển thị (Edit)
- Check database `step_images` table
- Chạy script: `node scripts/create_step_images_table.js`
- Check API trả về đúng `step_images_by_step` format

---

## 📝 Notes

- **Mật khẩu**: Được mã hóa bcrypt (không thể khôi phục)
- **JWT Token**: Hết hạn sau 7 ngày
- **Ảnh**: Được upload Cloudinary (production) hoặc local (development)
- **View Count**: Chống spam 1 IP/1 phút
- **Theme**: Lưu server (user_theme_preferences), không chỉ localStorage
- **Base64 Images**: Giới hạn 50MB (cho theme + ảnh nền)

---

## 🚀 Production Deployment

### Backend (Heroku / Railway)
```bash
1. Build: `npm run build` (nếu có)
2. Start: `npm start`
3. Env vars: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, CLOUDINARY_*
```

### Frontend (Vercel / Netlify)
```bash
1. Build: `npm run build`
2. Deploy: Upload `build/` folder
3. Env: REACT_APP_API_BASE=production_backend_url
```

---

## 📞 Support

- Check console (F12) cho lỗi
- Check server logs
- Check database connection
- Restart app: Ctrl+C then `npm start`

---

**Happy Cooking! 🍳**
