# 🚀 HƯỚNG DẪN THIẾT LẬP (SETUP GUIDE)

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: v16+
- **npm**: v7+
- **MySQL**: v5.7+
- **Git**: Tùy chọn

---

## 🎯 Bước 1: Cấu Hình Database MySQL

### 1.1 Mở MySQL Command Line
```bash
mysql -u root -p
# Nhập mật khẩu MySQL
```

### 1.2 Tạo Database
```sql
CREATE DATABASE cooking_app;
USE cooking_app;
```

### 1.3 Import SQL Schema
```bash
mysql -u root -p cooking_app < database.sql
```

### 1.4 Kiểm Tra Database
```sql
SHOW TABLES;
-- Kết quả: binh_luan, cong_thuc, danh_gia, favorite, nguoi_dung
```

---

## 🎯 Bước 2: Cấu Hình Backend

### 2.1 Chuyển vào thư mục backend
```bash
cd backend
```

### 2.2 Cài đặt dependencies
```bash
npm install
```

### 2.3 Tạo file `.env`
```bash
# Tạo file .env trong backend/
cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cooking_app
DB_PORT=3306

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

JWT_SECRET=your_secret_key
PORT=3001
EOF
```

### 2.4 Cập nhật config/db.js
```javascript
const db = require("mysql2").createConnection({
  host: "localhost",
  user: "root",
  password: "yourpassword",
  database: "cooking_app"
});
```

### 2.5 Chạy Backend
```bash
node server.js
# ✅ Backend đang chạy tại http://localhost:3001
```

---

## 🎯 Bước 3: Cấu Hình Frontend

### 3.1 Chuyển vào thư mục frontend
```bash
cd cooking-app
```

### 3.2 Cài đặt dependencies
```bash
npm install
```

### 3.3 Chạy Frontend
```bash
npm start
# ✅ Frontend chạy tại http://localhost:3000
```

---

## 🎯 Bước 4: Cấu Hình Cloudinary

### 4.1 Đăng ký Cloudinary
1. Truy cập https://cloudinary.com
2. Đăng ký tài khoản miễn phí
3. Vào Dashboard

### 4.2 Lấy API Keys
- Cloud Name: `<cloud_name>`
- API Key: `<api_key>`
- API Secret: `<api_secret>`

### 4.3 Cập nhật backend/.env
```bash
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4.4 Cập nhật config/cloudinary.js
```javascript
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

---

## ✅ Kiểm Tra Cài Đặt

### Backend Endpoints
```bash
# Kiểm tra server chạy
curl http://localhost:3001

# Test Đăng nhập
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cooking.com","password":"admin123"}'
```

### Frontend
```bash
# Mở browser
http://localhost:3000

# Kiểm tra trang:
- Home (/)
- Login (/login)
- Register (/register)
- Create Recipe (/create)
```

---

## 🐛 Xử Lý Lỗi

### Lỗi: "connect ECONNREFUSED"
**Nguyên nhân**: MySQL không chạy
**Giải pháp**:
```bash
# Windows
mysql -u root -p

# Linux/Mac
sudo service mysql start
```

### Lỗi: "ER_ACCESS_DENIED_ERROR"
**Nguyên nhân**: Sai mật khẩu MySQL
**Giải pháp**: Cập nhật mật khẩu trong `.env` và `db.js`

### Lỗi: "ENOENT: no such file or directory .env"
**Nguyên nhân**: File `.env` không tồn tại
**Giải pháp**: Tạo file `.env` theo hướng dẫn bước 2.3

### Lỗi: "CORS error"
**Nguyên nhân**: CORS chưa được cấu hình
**Giải pháp**: Kiểm tra `cors()` trong `server.js`

### Lỗi: "Image upload failed"
**Nguyên nhân**: Cloudinary chưa được cấu hình
**Giải pháp**: Kiểm tra API keys Cloudinary

---

## 📱 Chạy Trên Thiết Bị Di Động

### 1. Tìm IP của máy tính
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

### 2. Cập nhật API URL
Trong `cooking-app/src/`, thay thế:
```javascript
// Thay từ
http://localhost:3001

// Thành
http://<your-ip>:3001
```

### 3. Mở app trên điện thoại
```
http://<your-ip>:3000
```

---

## 🔒 Bảo Mật

### Đổi Secret Key JWT
**backend/routes/auth.js**:
```javascript
const token = jwt.sign({ id: user.id }, "YOUR_SECRET_KEY_HERE", { expiresIn: "7d" });
```

### Đổi Mật Khẩu Admin
```sql
UPDATE nguoi_dung SET password='<hashed_password>' WHERE id=1;
```

---

## 📊 Database Tables

### usuarios (người dùng)
```sql
id | username | email | password | role | created_at
```

### cong_thuc (công thức)
```sql
id | user_id | title | ingredients | steps | image_url | created_at
```

### binh_luan (bình luận)
```sql
id | recipe_id | user_id | comment | created_at
```

### danh_gia (đánh giá)
```sql
id | recipe_id | user_id | rating | created_at
```

### favorite (yêu thích)
```sql
id | user_id | recipe_id | created_at
```

---

## 🎓 Các Lệnh Hữu Dụng

### Kiểm tra ports
```bash
# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3001
lsof -i :3000
```

### Kill process
```bash
# Windows
taskkill /PID <pid> /F

# Linux/Mac
kill -9 <pid>
```

### Xóa node_modules
```bash
# Frontend
cd cooking-app && rm -rf node_modules && npm install

# Backend
cd backend && rm -rf node_modules && npm install
```

---

## 📚 Tài Liệu Tham Khảo

- [React](https://react.dev)
- [Express.js](https://expressjs.com)
- [MySQL](https://dev.mysql.com)
- [Cloudinary](https://cloudinary.com/documentation)
- [JWT](https://jwt.io)

---

## ✨ Tips

1. **Sử dụng Postman** để test API
2. **Bật DevTools** (F12) trên browser để debug
3. **Kiểm tra Console** khi có lỗi
4. **Dùng `npm start`** thay vì `node server.js`

---

**🎉 Chúc mừng! Bạn đã cài đặt thành công!**
