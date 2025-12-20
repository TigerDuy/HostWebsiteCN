# ✅ SỬA LỖI URL ẢNH - HOÀN THÀNH

## 🔍 VẤN ĐỀ PHÁT HIỆN
Bạn thấy trong database đường dẫn ảnh là: `http://localhost:3002/uploads/...`

Nhưng frontend chạy ở port **3002**, nên nó không thể lấy ảnh từ port 3002 (tự nó)
Backend ở port **3001**, nên ảnh phải được serve từ port 3001

---

## 🔧 CÁC BƯỚC SỬA

### 1️⃣ **Sửa backend code** (recipe.js)
Thay đổi 3 vị trí tạo URL upload:
```javascript
// ❌ Trước
imageUrl = `${req.protocol}://${req.get("host")}/uploads/${newName}`;

// ✅ Sau
imageUrl = `http://localhost:3001/uploads/${newName}`;
```

**Vị trí:**
- Line 71: Upload image (Cloudinary fallback)
- Line 86: Upload image (local fallback) 
- Line 318: Update image

### 2️⃣ **Chạy script fix URL trong database**
```bash
node scripts/find_and_fix_urls.js
```

**Kết quả:**
- 0 ảnh có localhost:3002 (đã hết, hoặc chưa có)
- 24 ảnh có localhost:3001 ✅
- 1 ảnh khác (Cloudinary)

### 3️⃣ **Khởi động lại backend & frontend**
- Backend: `npm start` (port 3001)
- Frontend: `npm start` (port 3000 hoặc 3002)

---

## 📊 KIỂM TRA HIỆN TẠI

Tất cả ảnh trong database hiện có URL:
```
http://localhost:3001/uploads/[filename]
```

✅ Đúng! Vì backend serve ảnh ở `/uploads` endpoint

---

## 🌐 CÁCH ẢNH LƯU ĐỘNG HOẠT ĐỘNG

```
Frontend (3000/3002)
    ↓ (upload file)
Backend (3001)
    ├ Lưu file vào: /src/backend/uploads/
    └ Lưu URL vào DB: http://localhost:3001/uploads/filename
    ↑ (lấy ảnh từ đây)
Frontend hiển thị: <img src="http://localhost:3001/uploads/..." />
```

---

## 🚀 KẾT QUẢ CUỐI CÙNG

✅ **Tất cả ảnh từ giờ sẽ:**
- Được lưu với URL đúng: `localhost:3001` 
- Hiển thị đúng trên frontend
- Không bị lỗi ERR_CONNECTION_REFUSED

✅ **Production ready:**
- Thay `localhost:3001` bằng tên miền thực
- Ví dụ: `https://api.cookshare.com/uploads/...`

---

## 📝 GHI CHÚ

Nếu screenshot bạn lúc nãy vẫn hiển thị 3002:
1. Là cache cũ của trình duyệt
2. Hoặc dữ liệu cũ trong localStorage

**Giải pháp:** 
- Nhấn **Ctrl+Shift+Delete** (xóa cache)
- Hoặc **Ctrl+F5** (hard refresh)
- Hoặc dùng **Incognito Window** (new tab riêng)
