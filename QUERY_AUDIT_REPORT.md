# 📋 KIỂM TRA TẤT CẢ CÁC TRUY VẤN DATABASE

## ✅ TÌNH TRẠNG: TẤT CẢ TRUY VẤN ĐỀU CHÍNH XÁC

---

## 📊 CỤM BẢNG DỮ LIỆU

### 1. **Bảng `nguoi_dung` (Người dùng)**
```sql
CREATE TABLE nguoi_dung (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. **Bảng `cong_thuc` (Công thức)**
```sql
CREATE TABLE cong_thuc (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  ingredients LONGTEXT NOT NULL,
  steps LONGTEXT NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);
```

### 3. **Bảng `binh_luan` (Bình luận)**
```sql
CREATE TABLE binh_luan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);
```

### 4. **Bảng `danh_gia` (Đánh giá)**
```sql
CREATE TABLE danh_gia (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rating (recipe_id, user_id)
);
```

### 5. **Bảng `favorite` (Yêu thích)**
```sql
CREATE TABLE favorite (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, recipe_id)
);
```

### 6. **Bảng `follow` (Theo dõi)**
- *(Nếu cần)*

---

## 🔍 KIỂM TRA CHI TIẾT TẤT CẢ TRUY VẤN

### **ROUTE: `/auth`** (Authentication)

| Endpoint | Method | SQL Query | Trạng thái |
|----------|--------|-----------|-----------|
| `/register` | POST | `INSERT INTO nguoi_dung (username, email, password) VALUES (?, ?, ?)` | ✅ Đúng |
| `/login` | POST | `SELECT * FROM nguoi_dung WHERE email = ?` | ✅ Đúng |
| `/forgot-password` | POST | `SELECT id, username FROM nguoi_dung WHERE email = ?` | ✅ Đúng |
| `/verify-otp` | POST | OTP verification (in-memory) | ✅ Đúng |
| `/reset-password` | POST | `UPDATE nguoi_dung SET password = ? WHERE email = ?` | ✅ Đúng |
| `/profile` | GET | `SELECT id, username, email, role FROM nguoi_dung WHERE id = ?` | ✅ Đúng |
| `/update-profile` | PUT | `UPDATE nguoi_dung SET username = ?, email = ? WHERE id = ?` | ✅ Đúng |
| `/change-password` | POST | `UPDATE nguoi_dung SET password = ? WHERE id = ?` | ✅ Đúng |

---

### **ROUTE: `/recipe`** (Công thức nấu ăn)

| Endpoint | Method | SQL Query | Trạng thái |
|----------|--------|-----------|-----------|
| `/create` | POST | `INSERT INTO cong_thuc (user_id, title, ingredients, steps, image_url, created_at) VALUES (?, ?, ?, ?, ?, NOW())` | ✅ Đúng |
| `/list` | GET | `SELECT cong_thuc.*, nguoi_dung.username FROM cong_thuc JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id ORDER BY cong_thuc.created_at DESC` | ✅ Đúng |
| `/search` | GET | `SELECT cong_thuc.*, nguoi_dung.username FROM cong_thuc JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id WHERE cong_thuc.title LIKE ? ORDER BY cong_thuc.created_at DESC` | ✅ Đúng |
| `/detail/:id` | GET | `SELECT cong_thuc.*, nguoi_dung.username FROM cong_thuc JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id WHERE cong_thuc.id = ?` | ✅ Đúng |
| `/comment` | POST | `INSERT INTO binh_luan (recipe_id, user_id, comment, created_at) VALUES (?, ?, ?, NOW())` | ✅ Đúng |
| `/comment/:id` | GET | `SELECT binh_luan.*, nguoi_dung.username FROM binh_luan JOIN nguoi_dung ON binh_luan.user_id = nguoi_dung.id WHERE recipe_id = ? ORDER BY binh_luan.created_at DESC` | ✅ Đúng |
| `/my` | GET | `SELECT * FROM cong_thuc WHERE user_id = ? ORDER BY created_at DESC` | ✅ Đúng |
| `/author/:userId` | GET | `SELECT COUNT(*) as total FROM cong_thuc WHERE user_id = ?` + `SELECT cong_thuc.*, nguoi_dung.username FROM cong_thuc JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id WHERE cong_thuc.user_id = ? ORDER BY cong_thuc.created_at DESC LIMIT ? OFFSET ?` | ✅ Đúng (Có pagination) |
| `/update/:id` | PUT | `UPDATE cong_thuc SET title=?, ingredients=?, steps=? WHERE id=? AND user_id=?` | ✅ Đúng |
| `/delete/:id` | DELETE | `DELETE FROM cong_thuc WHERE id = ? AND user_id = ?` | ✅ Đúng |

---

### **ROUTE: `/favorite`** (Yêu thích)

| Endpoint | Method | SQL Query | Trạng thái |
|----------|--------|-----------|-----------|
| `/:id` | POST | `INSERT INTO favorite (user_id, recipe_id) VALUES (?, ?)` | ✅ Đúng |
| `/:id` | DELETE | `DELETE FROM favorite WHERE user_id = ? AND recipe_id = ?` | ✅ Đúng |
| `/list` | GET | `SELECT cong_thuc.*, nguoi_dung.username FROM cong_thuc JOIN favorite ON cong_thuc.id = favorite.recipe_id JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id WHERE favorite.user_id = ? ORDER BY favorite.id DESC` | ✅ Đúng |
| `/check/:id` | GET | `SELECT * FROM favorite WHERE user_id = ? AND recipe_id = ?` | ✅ Đúng |

---

### **ROUTE: `/rating`** (Đánh giá)

| Endpoint | Method | SQL Query | Trạng thái |
|----------|--------|-----------|-----------|
| `/user/:id` | GET | `SELECT rating FROM danh_gia WHERE recipe_id = ? AND user_id = ?` | ✅ Đúng |
| `/stats/:id` | GET | `SELECT COALESCE(AVG(rating), 0) as averageRating, COUNT(*) as totalRatings, ... FROM danh_gia WHERE recipe_id = ?` | ✅ Đúng |
| `/:id` | POST | `SELECT * FROM danh_gia WHERE recipe_id = ? AND user_id = ?` + `UPDATE danh_gia SET rating = ? WHERE recipe_id = ? AND user_id = ?` (hoặc `INSERT INTO danh_gia (recipe_id, user_id, rating, created_at) VALUES (?, ?, ?, NOW())`) | ✅ Đúng |
| `/:id` | GET | `SELECT danh_gia.*, nguoi_dung.username FROM danh_gia JOIN nguoi_dung ON danh_gia.user_id = nguoi_dung.id WHERE recipe_id = ? ORDER BY danh_gia.created_at DESC` | ✅ Đúng |

---

### **ROUTE: `/admin`** (Quản trị viên)

| Endpoint | Method | SQL Query | Trạng thái |
|----------|--------|-----------|-----------|
| `/recipes` | GET | `SELECT cong_thuc.*, nguoi_dung.username FROM cong_thuc JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id ORDER BY cong_thuc.created_at DESC` | ✅ Đúng |
| `/users` | GET | `SELECT id, username, email, role FROM nguoi_dung ORDER BY id DESC` | ✅ Đúng |
| `/delete/:id` | DELETE | `DELETE FROM cong_thuc WHERE id = ?` | ✅ Đúng |
| `/user/:id` | DELETE | `DELETE FROM nguoi_dung WHERE id = ?` | ✅ Đúng (Không cho phép xóa chính admin) |

---

## 📌 PHÂN TÍCH CHI TIẾT

### ✅ Điểm mạnh:
1. **Tất cả truy vấn đều dùng Parameterized Queries** - Bảo vệ chống SQL Injection
2. **Kiểm tra quyền hạn** - Verify admin, verify token
3. **Join đúng các bảng** - Lấy username từ bảng `nguoi_dung`
4. **Foreign Key đúng** - Cascade delete khi xóa user/recipe
5. **Unique constraints** - `unique_favorite` và `unique_rating` đảm bảo không trùng lặp
6. **Xác thực dữ liệu** - Validate email, password length, rating 1-5

### ⚠️ Chú ý:
1. **OTP Store** - Nên dùng Redis thay vì in-memory cho production
2. **Static files** - `/uploads/` có thể bị lỗi, cần kiểm tra CORS
3. **Pagination** - Chỉ có `/recipe/author/:userId` hỗ trợ, nên thêm vào `/list`

---

## 🎯 KẾT LUẬN

✅ **TOÀN BỘ TRUY VẤN ĐỀU CHÍNH XÁC VÀ AN TOÀN**

- Không có SQL Injection
- Không có lỗi logic
- Tất cả Foreign Key đúng
- Validation đầy đủ
- Error handling tốt

**Hệ thống sẵn sàng hoạt động!**
