# Hướng dẫn sử dụng tính năng Ẩn/Bỏ Ẩn bài viết thủ công

## Tổng quan
Tính năng này cho phép Admin và Moderator ẩn bài viết vi phạm một cách chủ động, thay vì chờ đợi báo cáo từ người dùng.

## Các tính năng chính

### 1. **Ẩn bài viết thủ công**
- **Ai có thể sử dụng**: Admin và Moderator
- **Cách sử dụng**:
  1. Truy cập trang quản trị (Admin Dashboard)
  2. Tại bảng "Quản lý công thức", tìm bài viết cần ẩn
  3. Nhấn nút **"🚫 Ẩn"** bên cạnh bài viết
  4. Một hộp thoại sẽ xuất hiện yêu cầu nhập lý do
  5. Nhập lý do ẩn (tối đa 500 ký tự)
  6. Nhấn **"✅ Gửi & Ẩn bài viết"**

- **Kết quả**:
  - Bài viết sẽ bị ẩn khỏi danh sách công khai
  - Tác giả bài viết nhận thông báo trong hệ thống
  - Tác giả nhận email cảnh báo kèm lý do
  - Record được lưu vào bảng `admin_hidden_recipes`

### 2. **Bỏ ẩn bài viết**
- **Ai có thể sử dụng**: Admin và Moderator
- **Cách sử dụng**:
  1. Tại bảng "Quản lý công thức", tìm bài viết đang bị ẩn (hiển thị "🚫 Đã ẩn")
  2. Nhấn nút **"👁️ Bỏ ẩn"**
  3. Xác nhận trong hộp thoại

- **Kết quả**:
  - Bài viết được hiển thị lại công khai
  - Số lượng vi phạm được reset về 0
  - Tác giả nhận thông báo và email thông báo bỏ ẩn
  - Record ẩn được đánh dấu `is_active = FALSE`

### 3. **Xóa record ẩn (Bác bỏ)**
- **API endpoint**: `DELETE /recipe/admin-hidden/:id`
- **Mục đích**: Bác bỏ quyết định ẩn, bỏ ẩn bài viết mà không gửi thông báo
- **Sử dụng khi**: Admin/Moderator nhận thấy việc ẩn là không chính xác

## Sự khác biệt với hệ thống báo cáo

| Tính năng | Ẩn thủ công | Ẩn từ báo cáo |
|-----------|-------------|---------------|
| Ai thực hiện | Admin/Moderator | Hệ thống tự động |
| Điều kiện | Phát hiện vi phạm sớm | Đủ 3 báo cáo được xác nhận |
| Lý do | Admin tự nhập | Từ báo cáo của users |
| Thông báo | Gửi ngay lập tức | Gửi khi đủ 3 báo cáo |
| Record | Lưu trong `admin_hidden_recipes` | Tăng `violation_count` |

## Quy trình hoạt động

### Kịch bản 1: Admin phát hiện vi phạm sớm
1. Admin thấy bài viết vi phạm trước khi có báo cáo
2. Admin nhấn "Ẩn" và nhập lý do
3. Bài viết bị ẩn ngay lập tức
4. Tác giả nhận thông báo
5. Sau khi tác giả chỉnh sửa, admin có thể "Bỏ ẩn"

### Kịch bản 2: Bài viết bị báo cáo và xác nhận 3 lần
1. Users báo cáo bài viết
2. Admin/Moderator xác nhận 3 báo cáo
3. Hệ thống tự động ẩn bài viết (`violation_count >= 3`)
4. Admin có thể dùng nút "Bỏ ẩn" để hiển thị lại

### Kịch bản 3: Kết hợp cả hai
- Bài viết có thể bị ẩn bởi cả hai cơ chế
- Nút "Bỏ ẩn" sẽ xử lý cả hai trường hợp:
  - Nếu có record trong `admin_hidden_recipes` → cập nhật record
  - Nếu không có → chỉ reset `is_hidden` và `violation_count`

## API Endpoints

### 1. Ẩn bài viết
```
PUT /recipe/hide/:id
Headers: Authorization: Bearer <token>
Body: { reason: "Lý do ẩn bài viết" }
```

### 2. Bỏ ẩn bài viết
```
PUT /recipe/unhide/:id
Headers: Authorization: Bearer <token>
```

### 3. Xóa record ẩn
```
DELETE /recipe/admin-hidden/:id
Headers: Authorization: Bearer <token>
```

## Database Schema

### Bảng `admin_hidden_recipes`
```sql
CREATE TABLE admin_hidden_recipes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  hidden_by INT NOT NULL,        -- ID của admin/moderator
  reason TEXT NOT NULL,           -- Lý do ẩn
  is_active BOOLEAN DEFAULT TRUE, -- TRUE = đang ẩn
  unhidden_by INT NULL,           -- ID người bỏ ẩn
  unhidden_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Lưu ý quan trọng

1. **Quyền hạn**:
   - Admin và Moderator đều có quyền ẩn/bỏ ẩn
   - Chỉ Admin mới có quyền xóa bài viết hoàn toàn

2. **Thông báo**:
   - Email được gửi tự động khi ẩn/bỏ ẩn
   - Notification được tạo trong hệ thống
   - Tác giả có thể xem lý do trong thông báo

3. **Dữ liệu**:
   - Record ẩn không bị xóa, chỉ đánh dấu `is_active = FALSE`
   - Có thể tra cứu lịch sử ẩn/bỏ ẩn
   - `violation_count` được reset về 0 khi bỏ ẩn

4. **UI**:
   - Nút "Ẩn" hiển thị khi bài viết chưa bị ẩn
   - Nút "Bỏ ẩn" hiển thị khi bài viết đã bị ẩn
   - Modal có validation để đảm bảo lý do không trống

## Cài đặt

1. Chạy migration tạo bảng:
```bash
cd src/backend
node scripts/create_admin_hidden_table.js
```

2. Restart server backend:
```bash
node server.js
```

3. Build lại frontend (nếu cần):
```bash
cd src/cookshare
npm run build
```

## Troubleshooting

### Lỗi "Thiếu bảng admin_hidden_recipes"
- Chạy lại script migration: `node scripts/create_admin_hidden_table.js`

### Email không được gửi
- Kiểm tra cấu hình SMTP trong file `.env`
- Xem log trong console để biết chi tiết lỗi

### Notification không xuất hiện
- Kiểm tra bảng `notifications` có tồn tại không
- Verify user_id trong request

## Hỗ trợ
Nếu gặp vấn đề, vui lòng liên hệ team phát triển hoặc kiểm tra logs trong:
- Backend: Console output
- Frontend: Browser DevTools Console
