# 📋 Hệ Thống Báo Cáo Bài Viết - Tài Liệu Hoàn Chỉnh

## 1. Tổng Quan Tính Năng

### Mục Đích
Cho phép người dùng báo cáo các bài viết vi phạm quy tắc cộng đồng, và quản trị viên/điều độc xử lý báo cáo một cách hiệu quả.

### Quy Trình Báo Cáo
```
Người dùng → Báo cáo → Chờ xử lý → Admin xác nhận/bác bỏ → Email thông báo
   ↓                                        ↓
Ghi lại lý do                        Cảnh báo tác giả
                                     Thông báo người báo cáo
```

---

## 2. Cấu Trúc Database

### Bảng `bao_cao` (Reports)
```sql
CREATE TABLE IF NOT EXISTS bao_cao (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  user_id INT NOT NULL,
  reason VARCHAR(500) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  rejected_reason VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_report (recipe_id, user_id),
  FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);
```

**Giải thích:**
- `UNIQUE (recipe_id, user_id)`: Một user chỉ báo cáo một recipe một lần
- Sau khi bác bỏ, user có thể báo cáo lại (rejected status allows new report)
- `ON DELETE CASCADE`: Xóa recipe/user sẽ xóa báo cáo liên quan

---

## 3. Backend API

### Base URL: `/report`

#### 3.1 POST `/report/recipe/:id` - Gửi Báo Cáo
**Mô tả:** Người dùng gửi báo cáo về một bài viết

**Header:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Bài viết chứa hình ảnh không phù hợp"
}
```

**Response (201 Created):**
```json
{
  "message": "✅ Báo cáo thành công",
  "report": {
    "id": 1,
    "recipe_id": 5,
    "user_id": 12,
    "reason": "Bài viết chứa hình ảnh không phù hợp",
    "status": "pending",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400`: Recipe không tồn tại / Lý do báo cáo trống
- `409`: User đã báo cáo bài viết này (pending hoặc accepted)
- `401`: Chưa xác thực

---

#### 3.2 DELETE `/report/recipe/:id` - Hủy Báo Cáo
**Mô tả:** Hủy báo cáo đang chờ xử lý

**Header:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "✅ Hủy báo cáo thành công"
}
```

**Constraints:**
- Chỉ có thể hủy báo cáo có status = `pending`
- Sau khi hủy, user có thể báo cáo lại

---

#### 3.3 GET `/report/my-reports` - Xem Báo Cáo Của Tôi
**Mô tả:** Người dùng xem danh sách báo cáo của mình

**Header:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "recipe_id": 5,
    "recipe_title": "Cơm Tấm Sài Gòn",
    "reason": "Hình ảnh không phù hợp",
    "status": "pending",
    "rejected_reason": null,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "recipe_id": 8,
    "recipe_title": "Phở Bò",
    "reason": "Nội dung vi phạm",
    "status": "accepted",
    "rejected_reason": null,
    "created_at": "2025-01-14T15:20:00Z",
    "updated_at": "2025-01-14T16:45:00Z"
  }
]
```

---

#### 3.4 GET `/report?status=pending` - Xem Báo Cáo Chưa Xử Lý
**Mô tả:** Admin/Moderator xem danh sách báo cáo cần xử lý

**Query Parameters:**
- `status`: pending | accepted | rejected (mặc định: pending)

**Header:**
```
Authorization: Bearer {token}
Role: admin hoặc moderator
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "recipe_id": 5,
    "recipe_title": "Cơm Tấm Sài Gòn",
    "user_id": 12,
    "reporter_name": "Nguyễn Văn A",
    "reporter_email": "nguyenvana@gmail.com",
    "author_id": 3,
    "author_name": "Chủ Bài Viết",
    "author_email": "chubaiviet@gmail.com",
    "reason": "Hình ảnh không phù hợp",
    "status": "pending",
    "total_reports_for_recipe": 2,
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

**Thông tin chi tiết:**
- `total_reports_for_recipe`: Số lượng báo cáo cho bài viết này

---

#### 3.5 PUT `/report/:id/status` - Xử Lý Báo Cáo
**Mô tả:** Admin xác nhận hoặc bác bỏ báo cáo

**Header:**
```
Authorization: Bearer {token}
Content-Type: application/json
Role: admin hoặc moderator
```

**Body:**
```json
{
  "status": "accepted",
  "rejectedReason": "Optional - chỉ cần khi status = rejected"
}
```

**Response (200 OK):**
```json
{
  "message": "✅ Cập nhật báo cáo thành công"
}
```

**Hành động tự động:**

**Khi `status = "accepted"` (Xác nhận vi phạm):**
- Email gửi tác giả: Cảnh báo nội dung vi phạm
- Email gửi báo cáo: Cảm ơn
- Email gửi admin: Thông báo

**Khi `status = "rejected"` (Bác bỏ báo cáo):**
- Email gửi báo cáo: Giải thích lý do bác bỏ
- User có thể báo cáo lại sau này

---

## 4. Email Template

### Template 1: Cảnh báo Tác Giả (Accepted)
```
Tiêu đề: ⚠️ Bài viết của bạn vi phạm quy tắc cộng đồng

Nội dung:
Xin chào [Tác giả],

Bài viết "[Tên Bài Viết]" của bạn đã nhận được báo cáo từ cộng đồng 
vì lý do sau: "[Lý do vi phạm]"

Chúng tôi xác nhận báo cáo này là hợp lệ. Vui lòng kiểm tra nội dung 
của bài viết và tuân thủ các quy tắc cộng đồng của chúng tôi.

Nếu bạn tin rằng đây là một lỗi, vui lòng liên hệ với chúng tôi.

Trân trọng,
Đội Quản Trị CookShare
```

### Template 2: Cảm Ơn Báo Cáo (Accepted)
```
Tiêu đề: ✅ Cảm ơn bạn đã báo cáo

Nội dung:
Xin chào [Người báo cáo],

Cảm ơn bạn đã báo cáo bài viết "[Tên Bài Viết]". 
Chúng tôi đã xác nhận báo cáo của bạn là hợp lệ 
và đã xử lý theo quy tắc cộng đồng.

Đóng góp của bạn giúp chúng tôi tạo ra một cộng đồng 
an toàn và lành mạnh hơn.

Trân trọng,
Đội Quản Trị CookShare
```

### Template 3: Báo Cáo Bị Bác Bỏ
```
Tiêu đề: ℹ️ Báo cáo của bạn đã được xem xét

Nội dung:
Xin chào [Người báo cáo],

Chúng tôi đã xem xét báo cáo của bạn về bài viết "[Tên Bài Viết]".

Lý do bác bỏ: "[Lý do bác bỏ]"

Nếu bạn tìm thấy vấn đề tương tự trong tương lai, 
bạn có thể báo cáo lại.

Trân trọng,
Đội Quản Trị CookShare
```

---

## 5. Frontend Components

### 5.1 ReportButton.jsx
**Vị trí:** `src/cookshare/src/components/ReportButton.jsx`

**Props:**
```jsx
<ReportButton recipeId={5} />
```

**Tính năng:**
- Modal popup nhập lý do báo cáo
- Max 500 ký tự
- Button trạng thái: 🚩 Báo Cáo → ✅ Hủy Báo Cáo
- Xử lý lỗi tự động

**Sử dụng:**
```jsx
import ReportButton from "../components/ReportButton";

<div className="recipe-card">
  {/* ... recipe content ... */}
  <ReportButton recipeId={recipe.id} />
</div>
```

---

### 5.2 Notifications.jsx (Trang Thông Báo)
**Vị trị:** `src/cookshare/src/pages/Notifications.jsx`

**Chức năng:**
- **Tab 1: "Báo Cáo Của Tôi"** - Xem báo cáo của user
  - Hiển thị: Bài viết, lý do, status, ngày tạo
  - Nút "❌ Hủy Báo Cáo" (chỉ pending)
  - Nút "Báo Cáo Lại" (chỉ rejected)

- **Tab 2: "Báo Cáo Chưa Xử Lý"** (Admin/Moderator only)
  - Hiển thị: Bài viết, người báo cáo, lý do, tác giả, số báo cáo
  - Nút "✅ Xác Nhận" - Gửi cảnh báo tác giả
  - Nút "❌ Bác Bỏ" - Modal nhập lý do bác bỏ

**Truy cập:**
- User: Menu → 🔔 Thông báo
- Admin/Moderator: Menu → 🔔 Thông báo hoặc ⚠️ Quản Lý Báo Cáo

---

### 5.3 AdminReports.jsx (Trang Quản Lý Báo Cáo)
**Vị trí:** `src/cookshare/src/pages/AdminReports.jsx`

**Route:** `/admin/reports` (chỉ Admin/Moderator)

**Tính năng:**
- **Filter Tabs:**
  - ⏳ Chưa Xử Lý (pending)
  - ✅ Đã Xác Nhận (accepted)
  - ❌ Đã Bác Bỏ (rejected)

- **Xem Chi Tiết Báo Cáo:**
  - Tên bài viết, tác giả (email)
  - Người báo cáo (email)
  - Lý do báo cáo
  - Ngày báo cáo
  - Số lượng báo cáo cho bài viết

- **Hành Động (Pending):**
  - ✅ Xác Nhận Vi Phạm (status = accepted)
  - ❌ Bác Bỏ Báo Cáo (modal nhập lý do, status = rejected)

---

## 6. Quy Trình Xử Lý

### 6.1 Người Dùng Báo Cáo
```
1. Nhấn nút "🚩 Báo Cáo" trên bài viết
2. Modal hiện lên → nhập lý do (max 500 ký tự)
3. Nhấn "Gửi báo cáo"
4. API: POST /report/recipe/:id
5. Button thành "✅ Hủy Báo Cáo"
6. Thông báo: "✅ Báo cáo thành công"
```

### 6.2 Admin Xử Lý
```
1. Vào /admin/reports hoặc Notifications
2. Xem danh sách báo cáo chưa xử lý
3. Nhấn "✅ Xác Nhận" hoặc "❌ Bác Bỏ"

NẾDU XÁC NHẬN:
   - API: PUT /report/:id/status { status: "accepted" }
   - Gửi email cảnh báo tác giả
   - Gửi email cảm ơn báo cáo
   - Báo cáo di chuyển sang tab "Đã Xác Nhận"

NẾDU BÁC BỎ:
   - Modal nhập lý do bác bỏ
   - API: PUT /report/:id/status { status: "rejected", rejectedReason: "..." }
   - Gửi email giải thích lý do bác bỏ
   - Báo cáo di chuyển sang tab "Đã Bác Bỏ"
```

### 6.3 Báo Cáo Bị Bác Bỏ
```
1. Người dùng xem báo cáo ở Notifications
2. Status = "❌ Đã Bác Bỏ"
3. Xem lý do bác bỏ
4. Có thể báo cáo lại bài viết đó
   (vì UNIQUE constraint cho phép khi status ≠ pending/accepted)
```

---

## 7. Yêu Cầu Cấu Hình Environment

Tạo file `.env` trong `src/backend/`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=CookShare <your_email@gmail.com>
```

### Hướng Dẫn Cấu Hình Gmail
1. Bật 2-Step Verification: https://myaccount.google.com/security
2. Tạo App Password: https://myaccount.google.com/apppasswords
3. Copy app password vào `SMTP_PASS`

---

## 8. Kiểm Tra Lỗi

### Error Scenarios

| Trường Hợp | Status | Message |
|-----------|--------|---------|
| Recipe không tồn tại | 400 | "Bài viết không tồn tại" |
| Báo cáo trống | 400 | "Lý do báo cáo không được trống" |
| Đã báo cáo (pending) | 409 | "Bạn đã báo cáo bài viết này" |
| Đã báo cáo (accepted) | 409 | "Bạn đã báo cáo bài viết này" |
| User không tồn tại | 401 | "Xác thực thất bại" |
| Token hết hạn | 401 | "Token hết hạn" |

---

## 9. Permissions

| Chức Năng | User | Moderator | Admin |
|----------|------|-----------|-------|
| Báo cáo bài viết | ✅ | ✅ | ✅ |
| Xem báo cáo của mình | ✅ | ✅ | ✅ |
| Hủy báo cáo (pending) | ✅ | ✅ | ✅ |
| Xem báo cáo chưa xử lý | ❌ | ✅ | ✅ |
| Xác nhận/bác bỏ báo cáo | ❌ | ✅ | ✅ |
| Truy cập /admin/reports | ❌ | ✅ | ✅ |

---

## 10. Testing Checklist

- [ ] User báo cáo bài viết thành công
- [ ] Không thể báo cáo 2 lần (pending)
- [ ] Hủy báo cáo thành công
- [ ] Admin xem báo cáo chưa xử lý
- [ ] Admin xác nhận → email gửi đúng
- [ ] Admin bác bỏ → email gửi đúng
- [ ] User báo cáo lại sau khi bị bác bỏ
- [ ] Moderator có quyền xử lý nhưng không có quyền delete
- [ ] ReportButton hiển thị trên Home, MyRecipes, (RecipeDetail nếu có)

---

## 11. Tệp Liên Quan

**Backend:**
- `src/backend/routes/report.js` - API endpoints
- `src/backend/config/mailer.js` - Nodemailer config
- `src/backend/scripts/create_bao_cao_table.js` - Migration script

**Frontend:**
- `src/cookshare/src/components/ReportButton.jsx` - Component báo cáo
- `src/cookshare/src/components/ReportButton.css` - Styling
- `src/cookshare/src/pages/Notifications.jsx` - Trang thông báo
- `src/cookshare/src/pages/AdminReports.jsx` - Trang quản lý
- `src/cookshare/src/App.js` - Routes

**Database:**
- `src/database/database.sql` - Schema bao_cao table
- `.env` - Email configuration

---

## 12. Mở Rộng Trong Tương Lai

- [ ] Tự động mở khóa báo cáo sau 30 ngày
- [ ] Các hạn chế tự động (auto-ban) nếu quá nhiều báo cáo
- [ ] Báo cáo bình luận (ngoài bài viết)
- [ ] Chat support cho báo cáo
- [ ] Log audit đầy đủ
- [ ] Thống kê báo cáo theo tháng
