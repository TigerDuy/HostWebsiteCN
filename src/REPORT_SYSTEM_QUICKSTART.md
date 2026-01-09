# ⚡ Hệ Thống Báo Cáo - Hướng Dẫn Nhanh

## 1. Cài Đặt Nhanh

### Bước 1: Tạo Database Table
```bash
cd src/backend
node scripts/create_bao_cao_table.js
```
✅ Output: `✅ Tạo bảng bao_cao thành công!`

### Bước 2: Cấu Hình Email (`.env`)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=CookShare <your_email@gmail.com>
```

### Bước 3: Khởi động Server
```bash
cd src/backend
npm start
# Server chạy ở http://localhost:5000
```

### Bước 4: Khởi động Frontend
```bash
cd src/cookshare
npm start
# Frontend chạy ở http://localhost:3000
```

---

## 2. Sử Dụng Tính Năng

### Người Dùng Báo Cáo
```
1. Vào trang Home hoặc Công Thức Của Tôi
2. Nhấn nút "🚩 Báo Cáo" trên bài viết
3. Nhập lý do báo cáo (max 500 ký tự)
4. Nhấn "Gửi báo cáo"
✅ Thông báo: "Báo cáo thành công"
```

### Xem Báo Cáo Của Tôi
```
Menu (Avatar) → 🔔 Thông báo
→ Tab "Báo Cáo Của Tôi"
```

### Admin Xử Lý Báo Cáo
```
CÁCH 1: Trang Dedicated
Menu → ⚠️ Quản Lý Báo Cáo → Xử lý báo cáo

CÁCH 2: Từ Thông Báo
Menu → 🔔 Thông báo
→ Tab "Báo Cáo Chưa Xử Lý"
→ ✅ Xác Nhận hoặc ❌ Bác Bỏ
```

---

## 3. API Endpoints

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/report/recipe/:id` | Gửi báo cáo |
| DELETE | `/report/recipe/:id` | Hủy báo cáo |
| GET | `/report/my-reports` | Xem báo cáo của tôi |
| GET | `/report?status=pending` | Xem báo cáo chưa xử lý (Admin) |
| PUT | `/report/:id/status` | Xác nhận/bác bỏ báo cáo (Admin) |

---

## 4. Yêu Cầu

### Node.js & Database
- Node.js 16+
- MySQL 8.0+
- Nodemailer 7.0.10

### Tài Khoản Email
- Gmail (hoặc SMTP server khác)
- App Password cho Gmail (nếu dùng 2FA)

---

## 5. Kiểm Tra

```bash
# 1. Kiểm tra database
cd src/backend
node -e "
const db = require('./config/db');
db.query('SELECT COUNT(*) as count FROM bao_cao', (err, res) => {
  if (err) console.error(err);
  else console.log('✅ Bảng bao_cao tồn tại, số báo cáo:', res[0].count);
  process.exit();
});
"

# 2. Kiểm tra email config
# Kiểm tra .env có các biến cần thiết

# 3. Test API
curl -X GET http://localhost:5000/report/my-reports \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 6. Troubleshooting

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| Báo cáo không gửi được | Email không cấu hình | Cấu hình `.env` |
| Lỗi 409 (Conflict) | Đã báo cáo bài viết | Chỉ báo cáo một lần (pending) |
| Lỗi 400 (Bad Request) | Recipe không tồn tại | Kiểm tra recipe ID |
| Không thấy nút báo cáo | Component không import | Kiểm tra ReportButton import |
| Admin không nhìn thấy báo cáo | Role không phải admin | Kiểm tra role trong database |

---

## 7. File Cấu Trúc

```
src/
├── backend/
│   ├── routes/
│   │   └── report.js (NEW) ⭐
│   ├── config/
│   │   └── mailer.js (NEW) ⭐
│   ├── scripts/
│   │   └── create_bao_cao_table.js (NEW) ⭐
│   ├── server.js (MODIFIED)
│   └── .env (REQUIRED)
│
└── cookshare/
    └── src/
        ├── components/
        │   ├── ReportButton.jsx (NEW) ⭐
        │   ├── ReportButton.css (NEW) ⭐
        │   └── Navbar.jsx (MODIFIED)
        ├── pages/
        │   ├── Notifications.jsx (NEW) ⭐
        │   ├── Notifications.css (NEW) ⭐
        │   ├── AdminReports.jsx (NEW) ⭐
        │   ├── AdminReports.css (NEW) ⭐
        │   ├── Home.jsx (MODIFIED)
        │   ├── Home.css (MODIFIED)
        │   └── MyRecipes.jsx (MODIFIED)
        └── App.js (MODIFIED)
```

---

## 8. Permissions Matrix

| Action | User | Moderator | Admin |
|--------|------|-----------|-------|
| Báo cáo | ✅ | ✅ | ✅ |
| Xem báo cáo của mình | ✅ | ✅ | ✅ |
| Hủy báo cáo | ✅ | ✅ | ✅ |
| Xem chưa xử lý | ❌ | ✅ | ✅ |
| Xác nhận/bác bỏ | ❌ | ✅ | ✅ |
| Truy cập /admin/reports | ❌ | ✅ | ✅ |

---

## 9. Email Configuration Guide

### Gmail Setup (Recommended)

1. **Bật 2-Step Verification:**
   - https://myaccount.google.com/security
   - Chọn "2-Step Verification"
   - Làm theo hướng dẫn

2. **Tạo App Password:**
   - https://myaccount.google.com/apppasswords
   - Chọn "Mail" → "Windows Computer"
   - Google sẽ tạo password 16 ký tự
   - Copy password này vào `SMTP_PASS`

3. **`.env` Example:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=yourname@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   SMTP_FROM=CookShare <yourname@gmail.com>
   ```

### Custom SMTP Server
Thay đổi `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` tương ứng.

---

## 10. Workflow Diagram

```
USER SIDE:
┌─────────────────────────────────────┐
│ 1. Click "🚩 Báo Cáo"              │
├─────────────────────────────────────┤
│ 2. Enter reason (max 500 chars)    │
├─────────────────────────────────────┤
│ 3. POST /report/recipe/:id          │
├─────────────────────────────────────┤
│ 4. Button → "✅ Hủy Báo Cáo"      │
└─────────────────────────────────────┘

ADMIN SIDE:
┌─────────────────────────────────────┐
│ 1. View /admin/reports              │
├─────────────────────────────────────┤
│ 2. See pending reports (status=pending)
├─────────────────────────────────────┤
│ 3. Click "✅ Xác Nhận" or "❌ Bác Bỏ"
├─────────────────────────────────────┤
│ 4. PUT /report/:id/status           │
├─────────────────────────────────────┤
│ 5. Send emails to:                  │
│    - Author (warning)               │
│    - Reporter (thank/rejection)     │
│    - Admin (log)                    │
└─────────────────────────────────────┘

USER NOTIFICATION:
┌─────────────────────────────────────┐
│ View /notifications                 │
├─────────────────────────────────────┤
│ Tab 1: My Reports                   │
│   - Pending: Can cancel             │
│   - Accepted: Warning sent          │
│   - Rejected: Can report again      │
├─────────────────────────────────────┤
│ Tab 2: Unprocessed (Admin only)    │
│   - View pending reports            │
│   - Approve/Reject with reason      │
└─────────────────────────────────────┘
```

---

## 11. Status Flow

```
NEW REPORT
    ↓
[PENDING] ← User có thể hủy, Admin xem
    ├─→ [ACCEPTED] ← Email cảnh báo gửi
    │       ↓
    │     Đã xử lý (không thể hủy)
    │
    └─→ [REJECTED] ← Lý do bác bỏ gửi
            ↓
          User có thể báo cáo lại
```

---

## 12. Hỗ Trợ & Mở Rộng

**Cần thêm tính năng?**
- Báo cáo bình luận: Thêm `comment_id` field
- Auto-ban: Thêm logic đếm báo cáo accepted
- Báo cáo lịch sử: Thêm bảng `report_history`

**Liên hệ:** Xem `REPORT_SYSTEM_DOCUMENTATION.md` để chi tiết đầy đủ.

---

✅ **Hoàn tất cấu hình!** System báo cáo sẵn sàng sử dụng.
