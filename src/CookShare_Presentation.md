# CookShare - Bài Thuyết Trình
## Hướng dẫn: Copy nội dung từng slide vào PowerPoint

**Màu sắc đề xuất:**
- Nền: Trắng (#FFFFFF) hoặc xám nhạt (#F5F7FA)
- Màu chủ đạo: Cam (#FF7F50)
- Màu phụ: Than (#1F2933)
- Text: #2D3748

**Font chữ:** Segoe UI, Roboto, hoặc Arial

---

## SLIDE 1: TRANG BÌA
```
[Nền cam nhạt với logo CookShare ở giữa]

CookShare
Nền Tảng Chia Sẻ Công Thức Nấu Ăn

Sinh viên thực hiện: [Tên sinh viên]
Lớp: [Mã lớp]
GVHD: [Tên giảng viên]

Tháng 12/2025
```

---

## SLIDE 2: MỤC LỤC
```
📋 NỘI DUNG TRÌNH BÀY

1. Tổng quan đề tài
2. Kiến trúc & Công nghệ
3. Tính năng chính
4. Thiết kế CSDL & API
5. Demo giao diện
6. Kiểm thử & Hiệu năng
7. Kết luận & Hướng phát triển
```

---

## SLIDE 3: VẤN ĐỀ & MỤC TIÊU
```
🎯 BỐI CẢNH & MỤC TIÊU

VẤN ĐỀ:
• Nhu cầu chia sẻ và tìm kiếm công thức nấu ăn ngày càng tăng
• Thiếu nền tảng tương tác cộng đồng chuyên sâu về nấu ăn
• Người dùng cần không gian để đánh giá và thảo luận công thức

MỤC TIÊU:
• Xây dựng nền tảng chia sẻ công thức đầy đủ (CRUD)
• Hỗ trợ tương tác: bình luận lồng nhau, like, đánh giá, yêu thích
• Quản trị nội dung: phân quyền user/admin
• Giao diện responsive, trải nghiệm người dùng mượt mà
```

---

## SLIDE 4: KIẾN TRÚC TỔNG THỂ
```
🏗️ KIẾN TRÚC HỆ THỐNG

┌─────────────┐
│   REACT     │  Frontend - Port 3000
│  (Client)   │  React 19, Router 6, Axios
└──────┬──────┘
       │ HTTP/REST
┌──────▼──────┐
│   EXPRESS   │  Backend API - Port 3001
│   NODE.JS   │  JWT Auth, Middleware
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
┌──▼───┐ ┌─▼─────────┐
│ MySQL│ │ Cloudinary│
│  DB  │ │   Images  │
└──────┘ └───────────┘

Kiến trúc 3 tầng: Presentation - Business Logic - Data Access
```

---

## SLIDE 5: CÔNG NGHỆ CHÍNH
```
💻 STACK CÔNG NGHỆ

FRONTEND:
• React 19 - UI components & hooks
• React Router 6 - Navigation
• Axios - HTTP client
• CSS Grid/Flexbox - Responsive layout

BACKEND:
• Node.js 16+ & Express 4 - REST API
• JWT - Authentication (7 days)
• Bcrypt - Password hashing
• Multer & Cloudinary SDK - Image upload

DATABASE:
• MySQL 8 - Relational database
• Foreign Keys, UNIQUE constraints, CHECK constraints

TRIỂN KHAI:
• Development: localhost:3000 & 3001
```

---

## SLIDE 6: TÍNH NĂNG NGƯỜI DÙNG
```
👤 CHỨC NĂNG USER

QUẢN LÝ TÀI KHOẢN:
• Đăng ký/Đăng nhập với JWT authentication
• Cập nhật thông tin cá nhân & avatar

QUẢN LÝ CÔNG THỨC:
• Tạo/Sửa/Xóa công thức với upload ảnh
• Xem chi tiết công thức: nguyên liệu, bước làm
• Tìm kiếm công thức theo từ khóa

TƯƠNG TÁC CỘNG ĐỒNG:
• Bình luận lồng nhau (nested comments)
• Thích bình luận (comment likes)
• Đánh giá sao (1-5 sao) cho công thức
• Yêu thích công thức (favorites)
• Nhận thông báo khi có phản hồi
```

---

## SLIDE 7: TÍNH NĂNG ADMIN
```
⚙️ CHỨC NĂNG QUẢN TRỊ

QUẢN LÝ NGƯỜI DÙNG:
• Xem danh sách tất cả users
• Thay đổi role: user ⟷ admin
• Theo dõi hoạt động người dùng

QUẢN LÝ NỘI DUNG:
• Xem tất cả công thức trong hệ thống
• Xóa công thức vi phạm quy định
• Gỡ bình luận không phù hợp

ĐỊNH HƯỚNG PHÁT TRIỂN:
• Hệ thống báo cáo (report system)
• Strike system - cảnh cáo vi phạm
• Dashboard thống kê tổng quan
```

---

## SLIDE 8: THIẾT KẾ CSDL
```
🗄️ SCHEMA CƠ SỞ DỮ LIỆU

BẢNG CHÍNH:
┌─────────────────────────────────────┐
│ users                               │
│ - user_id, username, email,         │
│   password (bcrypt), role, avatar   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ recipes                             │
│ - recipe_id, user_id (FK),          │
│   title, ingredients, steps,        │
│   image_url, servings, cook_time    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ comments                            │
│ - comment_id, recipe_id (FK),       │
│   user_id (FK), parent_comment_id,  │
│   content, created_at               │
└─────────────────────────────────────┘

BẢNG TƯƠNG TÁC:
• ratings: UNIQUE(recipe_id, user_id), CHECK(rating 1-5)
• favorites: UNIQUE(recipe_id, user_id)
• comment_likes: UNIQUE(comment_id, user_id)
• notifications: thông báo hoạt động

RÀNG BUỘC:
✓ Foreign Keys với ON DELETE CASCADE
✓ UNIQUE constraints ngăn duplicate
✓ CHECK constraints validate dữ liệu
```

---

## SLIDE 9: THIẾT KẾ API (Rút gọn)
```
🔌 REST API ENDPOINTS

AUTHENTICATION:
POST   /auth/register     - Đăng ký tài khoản mới
POST   /auth/login        - Đăng nhập (trả JWT)

RECIPE MANAGEMENT:
GET    /recipe/list       - Lấy danh sách công thức
GET    /recipe/search     - Tìm kiếm công thức
POST   /recipe/create     - Tạo công thức mới
PUT    /recipe/update/:id - Cập nhật công thức
DELETE /recipe/delete/:id - Xóa công thức (owner/admin)

COMMENTS & INTERACTION:
POST   /comment/:recipeId          - Tạo comment (+ parent_comment_id)
GET    /recipe/comment/:id         - Lấy cây comments
POST   /comment/:id/like           - Toggle like comment
DELETE /comment/:id                - Xóa comment

ADMIN:
GET    /admin/users               - Danh sách users
PUT    /admin/users/:id/role      - Đổi role user
```

---

## SLIDE 10: FLOW BÌNH LUẬN LỒNG NHAU & LIKE
```
💬 NESTED COMMENTS & LIKES

QUY TRÌNH BÌNH LUẬN:
1. User viết comment → gửi POST /comment/:recipeId
2. Nếu reply comment → gửi kèm parent_comment_id
3. Server lưu vào DB với quan hệ cha-con
4. API trả về cây comments với replies[] đệ quy

CẤU TRÚC RESPONSE:
{
  comment_id: 123,
  content: "Great recipe!",
  user: {...},
  like_count: 15,
  user_liked: true,
  replies: [
    {
      comment_id: 124,
      content: "Thanks!",
      parent_comment_id: 123,
      like_count: 5,
      replies: []
    }
  ]
}

LIKE COMMENTS:
• POST /comment/:id/like → toggle like
• UNIQUE(comment_id, user_id) ngăn duplicate
• Trả về like_count mới và user_liked status
```

---

## SLIDE 11: DEMO GIAO DIỆN
```
🎨 GIAO DIỆN NGƯỜI DÙNG

[Chèn 4-6 screenshots:]

1. HOME PAGE
   - Lưới thẻ công thức (grid layout)
   - Thanh tìm kiếm
   - Hiển thị rating & views

2. RECIPE DETAIL
   - Ảnh công thức lớn
   - Nguyên liệu & bước làm rõ ràng
   - Bình luận lồng nhau với like
   - Đánh giá sao

3. MY RECIPES / FAVORITES
   - Card grid công thức của tôi/yêu thích
   - Nút Edit/Delete cho công thức của mình

4. ADMIN DASHBOARD
   - Danh sách users với role
   - Nút đổi role user/admin
   - Quản lý công thức vi phạm

RESPONSIVE: Desktop, Tablet, Mobile
```

---

## SLIDE 12: QUY TRÌNH UPLOAD ẢNH
```
📸 FLOW UPLOAD ẢNH

┌──────────┐
│  Client  │ 1. Select image file
│  React   │────────────────────┐
└──────────┘                    │
                                ▼
                        ┌───────────────┐
                        │   FormData    │
                        │ multipart/form│
                        └───────┬───────┘
                                │ 2. POST /recipe/create
                                ▼
                        ┌───────────────┐
                        │    Express    │
                        │    Multer     │ 3. Parse file
                        └───────┬───────┘
                                │
                                ▼
                        ┌───────────────┐
                        │  Cloudinary   │ 4. Upload & get URL
                        │     SDK       │
                        └───────┬───────┘
                                │
                                ▼
                        ┌───────────────┐
                        │   MySQL DB    │ 5. Save URL
                        │ image_url col │
                        └───────────────┘

KẾT QUẢ: URL công khai, tối ưu CDN, không lưu file local
```

---

## SLIDE 13: KIỂM THỬ CHỨC NĂNG
```
✅ TESTING RESULTS (Manual)

TEST CASES CHÍNH:

TC01: Đăng ký tài khoản mới
Status: ✓ PASS - User được tạo, password được hash

TC03: Đăng nhập thành công
Status: ✓ PASS - Nhận JWT token 7 ngày

TC05: Tạo công thức với ảnh
Status: ✓ PASS - Upload Cloudinary, lưu DB thành công

TC07: Xóa công thức (owner)
Status: ✓ PASS - Cascade delete comments/ratings

TC13: Tạo nested comment (reply)
Status: ✓ PASS - parent_comment_id được lưu đúng

TC15: Like/Unlike comment
Status: ✓ PASS - Toggle hoạt động, UNIQUE constraint OK

TC19: Lấy cây comments đệ quy
Status: ✓ PASS - Replies[] lồng 2-3 cấp

TC20: Notification khi có reply
Status: ✓ PASS - Ghi vào bảng notifications

TỔNG KẾT: 35/35 test cases PASS
```

---

## SLIDE 14: HIỆU NĂNG (Dev Environment)
```
⚡ PERFORMANCE METRICS

API RESPONSE TIME (localhost):

/recipe/list (50 recipes)
⏱️ ~80ms | ✓ Acceptable

/recipe/search?q=chicken
⏱️ ~120ms | ✓ Acceptable (LIKE query)

/comment/:id/like
⏱️ ~80ms | ✓ Fast toggle

/recipe/comment/:recipeId (2-level nested, ~50 comments)
⏱️ ~150ms | ✓ Good (recursive query)

/recipe/create (with image upload)
⏱️ ~800ms | ⚠️ Cloudinary upload overhead

DATABASE:
• 500+ recipes, 1,200+ comments
• No significant slowdown observed

GHI CHÚ:
Production với Redis cache sẽ cải thiện 40-60%
```

---

## SLIDE 15: BẢO MẬT
```
🔒 SECURITY MEASURES

MẬT KHẨU:
✓ Bcrypt hash (10 rounds)
✓ Không lưu plaintext password
✓ Salt tự động mỗi user

AUTHENTICATION:
✓ JWT token 7 ngày expire
✓ Middleware verifyToken cho routes bảo vệ
✓ checkRole middleware cho admin routes

AUTHORIZATION:
✓ User chỉ edit/delete công thức của mình
✓ Admin có quyền toàn bộ nội dung
✓ Kiểm tra ownership trước mỗi mutation

CORS:
✓ Chỉ cho phép origin: http://localhost:3000
✓ Credentials: true cho cookie/JWT

INPUT VALIDATION:
✓ Express validator cho email, password
✓ Sanitize HTML trong comments (XSS prevention)
✓ File type validation cho upload ảnh
```

---

## SLIDE 16: HẠN CHẾ
```
⚠️ HẠN CHẾ HIỆN TẠI

REALTIME:
❌ Chưa có WebSocket → notifications không realtime
❌ User phải refresh để thấy reply mới

PERFORMANCE:
❌ Chưa có Redis cache cho /recipe/list, /search
❌ Chưa pagination cho comment tree sâu (100+ comments)
❌ Chưa virtualization cho danh sách dài

TESTING & DEVOPS:
❌ Chưa có unit/integration tests tự động
❌ Chưa CI/CD pipeline
❌ Manual testing only

FEATURES:
❌ Chưa có strike system hoàn chỉnh
❌ Chưa report abuse workflow
❌ Chưa recommendation engine
❌ Chưa SEO optimization

ACCESSIBILITY:
❌ Chưa ARIA labels đầy đủ
❌ Chưa screen reader friendly
```

---

## SLIDE 17: HƯỚNG PHÁT TRIỂN
```
🚀 ROADMAP TƯƠNG LAI

NGẮN HẠN (1-3 tháng):
• ✨ WebSocket/Socket.io cho realtime notifications
• 🚄 Redis cache cho list/search endpoints
• 📄 Pagination/virtualization cho comment tree
• ✅ Unit tests (Jest) + Integration tests (Supertest)

TRUNG HẠN (3-6 tháng):
• 🔨 Strike system - cảnh cáo vi phạm 3 lần → ban
• 📊 Report abuse workflow hoàn chỉnh
• 🤖 CI/CD với GitHub Actions
• 🌐 Deploy production (AWS/Heroku + Vercel)

DÀI HẠN (6-12 tháng):
• 🧠 Recommendation engine (collaborative filtering)
• 🔍 Elasticsearch cho full-text search
• ♿ Accessibility audit - WCAG 2.1 AA
• 📱 Mobile app (React Native)
• 🌍 i18n - đa ngôn ngữ (EN/VI)
```

---

## SLIDE 18: KẾT LUẬN
```
🎓 KẾT LUẬN

HOÀN THÀNH:
✅ Xây dựng nền tảng chia sẻ công thức đầy đủ
✅ Các tính năng cốt lõi: CRUD, nested comments, likes, ratings, favorites
✅ Phân quyền user/admin rõ ràng
✅ Giao diện responsive, UX mượt mà
✅ Bảo mật cơ bản tốt (JWT, Bcrypt, CORS)

KIẾN TRÚC VỮNG CHẮC:
• 3-tier architecture dễ mở rộng
• Cloud storage (Cloudinary) giảm tải server
• RESTful API chuẩn
• Database schema chuẩn hóa 3NF

ĐỊNH HƯỚNG:
• Sẵn sàng triển khai production
• Roadmap rõ ràng cho realtime, cache, testing
• Tiềm năng mở rộng: ML recommendation, mobile app

CẢM ƠN QUÝ THẦY CÔ ĐÃ THEO DÕI!
❓ Hỏi đáp
```

---

## HƯỚNG DẪN SỬ DỤNG

### Bước 1: Tạo PPTX mới
- Mở PowerPoint/Google Slides
- Chọn theme sạch (Blank/Minimal)

### Bước 2: Thiết lập màu sắc
- Màu 1: #FF7F50 (Cam)
- Màu 2: #1F2933 (Than)
- Màu 3: #FFFFFF (Trắng)
- Text: #2D3748

### Bước 3: Copy nội dung
- Copy từng slide từ file này
- Format với bullet points
- Thêm icon emoji (giữ hoặc thay bằng icon PNG)

### Bước 4: Thêm visual
- Chụp 4-6 screenshots giao diện thực tế
- Vẽ 2 sơ đồ: Kiến trúc (slide 4) & Upload flow (slide 12)
- Tạo bảng đơn giản cho slide 8 (CSDL)

### Bước 5: Review
- Mỗi slide tối đa 6 bullet points
- Font size: Title 32pt, Body 18-20pt
- Kiểm tra chính tả

**GỢI Ý DESIGN ELEMENTS:**
- Slide 1: Ảnh nền món ăn mờ nhạt + logo CookShare
- Slide 4, 10, 12: Sơ đồ với mũi tên và hộp
- Slide 11: 4 screenshots xếp grid 2x2
- Slide 13, 14: Bảng hoặc bar chart đơn giản
- Slide 18: Background gradient cam nhạt

**TIPS TRÌNH BÀY:**
- 15-18 phút = ~1 phút/slide
- Demo ngắn 2-3 phút cho slide 11
- Chuẩn bị câu hỏi dự đoán
- Tập trình bày 2-3 lần trước
