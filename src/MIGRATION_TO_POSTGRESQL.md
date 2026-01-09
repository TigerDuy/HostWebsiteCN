# Hướng dẫn chuyển đổi từ MySQL sang PostgreSQL trên Render.com

## Bước 1: Tạo PostgreSQL Database trên Render

1. Đăng nhập [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → chọn **"PostgreSQL"**
3. Điền thông tin:
   - **Name**: `cookshare-db`
   - **Database**: `cookingdb`
   - **User**: để mặc định
   - **Region**: chọn **cùng region với backend** (Singapore nếu backend ở Singapore)
   - **Plan**: Free hoặc Starter
4. Click **"Create Database"**
5. Đợi database khởi tạo xong (1-2 phút)

## Bước 2: Lấy Connection String

1. Vào database vừa tạo
2. Copy **"External Database URL"** (dạng: `postgresql://user:password@host:5432/cookingdb`)

## Bước 3: Import Schema và Dữ liệu

File `src/database/cookingdb_postgres_full.sql` đã chứa cả schema và dữ liệu từ MySQL.

### Cách 1: Dùng psql (Khuyến nghị)
```bash
# Trên Windows (PowerShell)
psql "postgresql://user:password@host:5432/cookingdb" -f src/database/cookingdb_postgres_full.sql

# Hoặc dùng biến môi trường
$env:DATABASE_URL = "postgresql://user:password@host:5432/cookingdb"
psql $env:DATABASE_URL -f src/database/cookingdb_postgres_full.sql
```

### Cách 2: Dùng pgAdmin
1. Kết nối đến database bằng External Database URL
2. Mở Query Tool
3. Copy nội dung file `cookingdb_postgres_full.sql` và chạy

### Cách 3: Dùng Render Shell
1. Vào PostgreSQL database trên Render
2. Click **"Shell"** tab
3. Copy từng phần của file SQL và paste vào shell

## Bước 4: Cập nhật Environment Variables trên Render

Vào **Backend Service** → **Environment** → Thêm/Sửa:

```
DATABASE_URL=postgresql://user:password@host:5432/cookingdb
```

(Thay bằng External Database URL bạn vừa copy)

## Bước 5: Deploy Backend

1. Commit và push code lên GitHub
2. Render sẽ tự động deploy
3. Kiểm tra logs để đảm bảo kết nối thành công:
   ```
   ✅ Kết nối PostgreSQL thành công!
   ```

## Các thay đổi đã thực hiện trong code

### 1. `src/backend/config/db.js`
- Thay `mysql2` bằng `pg` (PostgreSQL driver)
- Tự động chuyển đổi MySQL syntax sang PostgreSQL:
  - `?` → `$1, $2, ...`
  - `DATE_SUB(NOW(), INTERVAL x DAY)` → `NOW() - INTERVAL '1 DAY' * x`
  - `IFNULL` → `COALESCE`
  - Tự động thêm `RETURNING id` cho INSERT queries

### 2. `src/backend/routes/recipe.js`
- `ON DUPLICATE KEY UPDATE` → `ON CONFLICT DO NOTHING`

### 3. `src/backend/routes/notification.js`
- `JSON_SET` → PostgreSQL JSONB operators
- `JSON_EXTRACT` → `->>'key'` operator

### 4. `src/database/cookingdb_postgres_full.sql`
- Schema mới cho PostgreSQL với:
  - `SERIAL` thay cho `AUTO_INCREMENT`
  - `TIMESTAMP` thay cho `DATETIME`
  - Custom ENUM types
  - `JSONB` thay cho `JSON`
- Bao gồm tất cả dữ liệu từ MySQL dump

## Lưu ý quan trọng

1. **Backup dữ liệu** trước khi migrate
2. **Test kỹ** trên môi trường staging trước khi deploy production
3. PostgreSQL **case-sensitive** với tên bảng/cột nếu dùng quotes
4. Free tier của Render PostgreSQL có giới hạn:
   - 256MB storage
   - 97 connections
   - Database sẽ bị xóa sau 90 ngày không hoạt động

## Troubleshooting

### Lỗi kết nối SSL
Đảm bảo `ssl: { rejectUnauthorized: false }` trong config

### Lỗi "relation does not exist"
Chạy lại file `cookingdb_postgres_full.sql` để tạo tables

### Lỗi "column does not exist"
Kiểm tra tên cột có đúng không (PostgreSQL case-sensitive với quotes)

### Lỗi syntax
Kiểm tra logs để xem query gốc và query đã chuyển đổi

### Lỗi ENUM type
Nếu gặp lỗi với ENUM, có thể cần DROP TYPE trước khi tạo lại:
```sql
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
```
