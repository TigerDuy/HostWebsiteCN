# BÁO CÁO ĐỒ ÁN CHUYÊN NGÀNH

## MỞ ĐẦU

### Lý do chọn đề tài

Nấu ăn là một trong những hoạt động hàng ngày quan trọng của con người, nhưng việc tìm kiếm các công thức nấu ăn mới luôn là thách thức. Hiện nay, mặc dù có nhiều trang web chia sẻ công thức, nhưng các trang này thường:

- Không cung cấp chức năng đánh giá và bình luận chi tiết
- Thiếu tính tương tác giữa người dùng
- Giao diện không thân thiện hoặc khó sử dụng
- Chức năng tìm kiếm không hiệu quả

Do đó, xây dựng một nền tảng web hiện đại để chia sẻ công thức nấu ăn với các tính năng tương tác cao, giao diện thân thiện và các công cụ tìm kiếm mạnh mẽ là một nhu cầu thực tiễn.

### Mục đích và đối tượng nghiên cứu

**Mục đích:**
- Xây dựng một website chia sẻ công thức nấu ăn có đầy đủ các tính năng: đăng ký, đăng nhập, tạo công thức, chỉnh sửa, xóa
- Cung cấp chức năng tương tác như bình luận, đánh giá, yêu thích
- Triển khai hệ thống quản lý admin để kiểm duyệt nội dung
- Tối ưu hóa trải nghiệm người dùng với giao diện đáp ứng

**Đối tượng nghiên cứu:**
- Những người yêu thích nấu ăn muốn chia sẻ công thức của mình
- Những người tìm kiếm công thức nấu ăn mới
- Cộng đồng yêu bếp luôn muốn kết nối và trao đổi kinh nghiệm

**Phạm vi:**
- Giao diện người dùng: Trang web đáp ứng (điện thoại, máy tính bảng, máy tính)
- Máy chủ ứng dụng: Xây dựng hệ thống xử lý dữ liệu
- Cơ sở dữ liệu: Quản lý người dùng, công thức, bình luận, đánh giá
- Bảng điều khiển quản trị: Quản lý người dùng và nội dung

---

## CHƯƠNG 1: TỔNG QUAN

### 1.1 Giới thiệu chung

Tên dự án: CookShare - Nền tảng chia sẻ công thức nấu ăn

CookShare là một nền tảng web chia sẻ công thức nấu ăn được xây dựng với mục đích tạo ra một cộng đồng nấu ăn trực tuyến năng động. Người dùng có thể:

- **Chia sẻ công thức**: Đăng công thức nấu ăn của riêng mình bao gồm tên, nguyên liệu, hướng dẫn và hình ảnh
- **Tìm kiếm công thức**: Sử dụng thanh tìm kiếm để khám phá công thức theo từ khóa
- **Tương tác**: Bình luận, đánh giá (1-5 sao), và yêu thích công thức
- **Quản lý nội dung**: Chỉnh sửa hoặc xóa công thức của mình

Ngoài ra, hệ thống còn cung cấp bảng điều khiển quản trị để kiểm duyệt nội dung và quản lý người dùng.

### 1.2 Tình hình hiện tại

Thị trường các trang chia sẻ công thức nấu ăn đang phát triển mạnh mẽ, nhưng:

- Hầu hết các trang hiện tại tập trung vào hiển thị công thức mà không chú trọng đến tương tác cộng đồng
- Chức năng đánh giá và bình luận thường bị bỏ qua hoặc kém hiệu quả
- Giao diện không tối ưu cho thiết bị di động
- Không có hệ thống quản trị đủ mạnh để quản lý nội dung

### 1.3 Những thách thức và cơ hội

**Thách thức:**
- Xây dựng hệ thống xác thực an toàn
- Tối ưu hóa tìm kiếm để người dùng dễ dàng tìm thấy công thức
- Quản lý hình ảnh hiệu quả với lưu trữ đám mây
- Đảm bảo giao diện đáp ứng trên mọi thiết bị
- Triển khai hệ thống đánh giá hiệu quả

**Cơ hội:**
- Xây dựng một cộng đồng người yêu thích nấu ăn
- Mở rộng thêm các tính năng như yêu cầu công thức, video hướng dẫn
- Phát triển ứng dụng di động
- Tích hợp trí tuệ nhân tạo để đề xuất công thức phù hợp

---

## CHƯƠNG 2: NGHIÊN CỨU LÝ THUYẾT

Chương này trình bày cơ sở lý thuyết, lý luận, giả thiết khoa học và phương pháp nghiên cứu đã được sử dụng trong đồ án.

### 2.1 Công Nghệ Web Hiện Đại

#### 2.1.1 Giao diện người dùng - React

React là một thư viện được phát triển để xây dựng giao diện người dùng. Các đặc điểm chính:

- **Dựa trên thành phần**: Chia giao diện thành các thành phần nhỏ, có thể tái sử dụng
- **Dựa trên thành phần**: Chia giao diện thành các thành phần nhỏ, có thể tái sử dụng
- **Virtual DOM (Bộ nhớ ảo)**: Tối ưu hóa hiệu suất bằng cách cập nhật chỉ những phần thay đổi
- **State management (Quản lý trạng thái)**: Quản lý trạng thái ứng dụng một cách hiệu quả

Trong dự án, React được sử dụng để:
- Xây dựng giao diện đáp ứng
- Quản lý trạng thái của người dùng (đăng nhập, công thức, yêu thích)
- Điều hướng giữa các trang

#### 2.1.2 Máy chủ ứng dụng - Node.js và Express

Node.js là một nền tảng thực thi cho phép xây dựng các ứng dụng máy chủ hiệu suất cao. Express là khung web nhẹ và linh hoạt:

 - **Non-blocking I/O (Nhập/xuất không chặn)**: Xử lý nhiều yêu cầu đồng thời mà không chặn
 - **Middleware architecture (Kiến trúc middleware)**: Dễ dàng mở rộng chức năng

Trong dự án, Node.js và Express được sử dụng để:
- Xử lý các yêu cầu từ giao diện
- Xác thực người dùng
- Quản lý dữ liệu công thức, bình luận, đánh giá
- Kiểm soát quyền truy cập

#### 2.1.3 Cơ sở dữ liệu - MySQL

MySQL là hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở:

- **Tuân thủ ACID**: Đảm bảo tính toàn vẹn dữ liệu
- **Khả năng mở rộng**: Có thể xử lý lượng dữ liệu lớn

Cơ sở dữ liệu của dự án bao gồm các bảng:
- Bảng người dùng: Lưu thông tin người dùng
- Bảng công thức: Lưu công thức
- Bảng bình luận: Lưu bình luận
- Bảng đánh giá: Lưu đánh giá sao từ người dùng
- Bảng yêu thích: Lưu công thức yêu thích

---

### 2.2 Bảo Mật và Xác Thực

#### 2.2.1 JSON Web Token (JWT) (Mã thông báo web)

JSON Web Token (JWT) là một tiêu chuẩn mở để tạo mã thông báo truy cập dựa trên yêu cầu.

**Cấu trúc gồm 3 phần:**
1. **Header (Tiêu đề)**: Chứa loại mã thông báo và thuật toán mã hóa
2. **Payload (Nội dung)**: Chứa thông tin người dùng như mã định danh, thư điện tử, vai trò
3. **Signature (Chữ ký)**: Ký số để xác thực tính xác thực

**Lợi ích:**
- **Stateless (Không trạng thái)**: Máy chủ không cần lưu trữ phiên làm việc
- **Scalable (Khả năng mở rộng)**: Có thể sử dụng trong kiến trúc dịch vụ
- **Secure (An toàn)**: Được ký số nên khó giả mạo

Trong dự án:
- JWT được tạo khi người dùng đăng nhập thành công (hạn 7 ngày)
- JWT được gửi trong tiêu đề `Authorization` cho mỗi yêu cầu
- Middleware (phần mềm trung gian) xác minh JWT trước khi xử lý yêu cầu

#### 2.2.2 Mã hóa mật khẩu - Bcrypt

Bcrypt là thuật toán mã hóa mật khẩu được thiết kế đặc biệt:

 - **Adaptive hashing (Mã hóa thích ứng)**: Có thể điều chỉnh độ phức tạp theo thời gian
 - **Salt (Muối)**: Thêm chuỗi ngẫu nhiên trước khi mã hóa để tránh tấn công bằng bảng bảy màu (rainbow table)
 - **One-way (Một chiều)**: Hàm băm một chiều, không thể giải ngược thành mật khẩu gốc

Quy trình:
1. Người dùng nhập mật khẩu
2. Bcrypt mã hóa mật khẩu với chất
3. Lưu mã hóa vào cơ sở dữ liệu
4. Khi đăng nhập, so sánh mật khẩu nhập với mã hóa đã lưu

#### 2.2.3 CORS (Cross-Origin Resource Sharing) (Chia sẻ tài nguyên giữa các nguồn gốc)

CORS (Cross-Origin Resource Sharing) là cơ chế cho phép giao diện truy cập máy chủ ứng dụng trên tên miền khác:

- Giao diện chạy trên `http://localhost:3000`
- Máy chủ ứng dụng chạy trên `http://localhost:3001`
- Header CORS được cấu hình để cho phép yêu cầu từ giao diện

---

### 2.3 Kiến Trúc và Mẫu Thiết Kế

#### 2.3.1 REST (Kiến trúc REST)

Kiến trúc REST (Representational State Transfer) là cách tiếp cận phổ biến để xây dựng dịch vụ web:

**Các nguyên tắc chính:**
- **Resource-oriented (Định hướng tài nguyên)**: Mỗi điểm cuối đại diện cho một tài nguyên (công thức, người dùng, đánh giá)
- **HTTP methods (Phương thức HTTP)**:
   - `GET` : Lấy dữ liệu
   - `POST`: Tạo dữ liệu mới
   - `PUT` : Cập nhật dữ liệu
   - `DELETE`: Xóa dữ liệu
- **Status Codes (Mã trạng thái)**: Sử dụng mã trạng thái HTTP để chỉ ra kết quả (200, 201, 400, 401, 404, 500)

Ví dụ các điểm cuối chính của dự án:
```
POST   /auth/register        - Đăng ký
POST   /auth/login           - Đăng nhập
GET    /recipe/list          - Lấy danh sách công thức
GET    /recipe/search?q=     - Tìm kiếm công thức
POST   /recipe/create        - Tạo công thức
PUT    /recipe/update/:id    - Cập nhật công thức
DELETE /recipe/delete/:id    - Xóa công thức
POST   /rating/:id           - Đánh giá
GET    /rating/stats/:id     - Thống kê đánh giá
POST   /favorite/:id         - Yêu thích
DELETE /favorite/:id         - Bỏ yêu thích
```

#### 2.3.2 MVC (Model-View-Controller) (Mẫu MVC)

Dự án áp dụng mẫu MVC (Model-View-Controller):

- **Model (Mô hình)**: Lớp cơ sở dữ liệu (các truy vấn, xác thực)
- **View (Giao diện)**: Giao diện React (các thành phần)
- **Controller (Điều khiển)**: Xử lý logic trong các tuyến

#### 2.3.3 Thiết Kế đáp ứng

Thiết kế đáp ứng đảm bảo giao diện hiển thị tốt trên mọi thiết bị:

- **Tiếp cận di động trước**: Thiết kế cho di động trước, sau đó mở rộng cho máy tính bảng và máy tính
- **Truy vấn phương tiện**: Điều chỉnh kiểu dáng dựa trên kích thước màn hình
- **Bố cục linh hoạt**: Sử dụng bố cục linh hoạt để bố cục linh hoạt

Dự án hỗ trợ:
- Điện thoại di động (320px - 480px)
- Máy tính bảng (481px - 768px)
- Máy tính để bàn (768px+)

---

## CHƯƠNG 3: HIỆN THỰC HÓA NGHIÊN CỨU

Chương này mô tả các bước nghiên cứu đã tiến hành, các bản thiết kế, cách thức cài đặt chương trình và hiện thực hóa nghiên cứu.

### 3.1 Phân Tích và Thiết Kế Hệ Thống

#### 3.1.1 Đặc Tả Nhu Cầu

**Nhu cầu chức năng:**

1. **Xác thực và Quản lý Người dùng**
   - Đăng ký tài khoản với thư điện tử và mật khẩu
   - Đăng nhập với xác thực
   - Lấy thông tin người dùng
   - Phân quyền người dùng (người dùng, quản trị viên)

2. **Quản lý Công Thức**
   - Tạo công thức mới (tên, nguyên liệu, hướng dẫn, hình ảnh)
   - Xem danh sách công thức
   - Xem chi tiết công thức
   - Chỉnh sửa công thức (chỉ người tạo)
   - Xóa công thức (chỉ người tạo hoặc quản trị viên)
   - Tìm kiếm công thức theo từ khóa

3. **Tương Tác và Bình Luận**
   - Bình luận trên công thức
   - Đánh giá công thức (1-5 sao)
   - Xem thống kê đánh giá
   - Yêu thích công thức
   - Xem công thức yêu thích

4. **Quản lý Quản trị viên**
   - Xem danh sách tất cả công thức
   - Xem danh sách tất cả người dùng
   - Xóa công thức bất kỳ
   - Xóa người dùng
   - Xem thống kê

**Nhu cầu phi chức năng:**
- **Hiệu suất**: Thời gian phản hồi dịch vụ < 500 mili giây
- **Bảo mật**: Sử dụng bảo mật tầng vận chuyển, JWT, mã hóa mật khẩu
- **Khả dụng**: Hệ thống hoạt động liên tục
- **Khả năng mở rộng**: Có thể thêm tính năng mới dễ dàng
- **Đáp ứng**: Giao diện hoạt động tốt trên mọi thiết bị

#### 3.1.2 Phân Tích Yêu Cầu

**Những người tham gia (Những người dùng hệ thống):**
1. **Người dùng (Người dùng bình thường)**
   - Có thể đăng ký, đăng nhập, tạo công thức
   - Có thể bình luận, đánh giá, yêu thích
   - Chỉ có quyền chỉnh sửa/xóa công thức của mình

2. **Quản trị viên (Người quản lý)**
   - Có toàn quyền xem các công thức, người dùng
   - Có thể xóa bất kỳ công thức nào
   - Có thể xóa người dùng
   - Truy cập bảng điều khiển quản lý

**Các tình huống sử dụng chính:**
```
1. Đăng ký
   - Người dùng nhập thư điện tử, mật khẩu
   - Hệ thống kiểm tra thư điện tử chưa tồn tại
   - Mã hóa mật khẩu, lưu vào cơ sở dữ liệu
   - Trả về thông báo thành công

2. Đăng nhập
   - Người dùng nhập thư điện tử, mật khẩu
   - Hệ thống kiểm tra thư điện tử và mật khẩu
   - Tạo JWT (mã thông báo)
   - Trả về JWT cho người dùng

3. Tạo công thức
   - Người dùng phải đăng nhập
   - Nhập tiêu đề, nguyên liệu, các bước, tải lên ảnh
   - Hệ thống lưu công thức vào cơ sở dữ liệu
   - Trả về công thức vừa tạo

4. Tìm kiếm công thức
   - Người dùng nhập từ khóa tìm kiếm
   - Hệ thống truy vấn cơ sở dữ liệu tìm công thức
   - Trả về danh sách công thức

5. Đánh giá công thức
   - Người dùng phải đăng nhập
   - Chọn số sao (1-5)
   - Hệ thống lưu vào bảng đánh giá
   - Kiểm tra người dùng chỉ đánh giá 1 lần
   - Cập nhật thống kê
```

#### 3.1.3 Thiết Kế Kiến Trúc Hệ Thống

**Kiến trúc tổng quát - Kiến trúc 3 lớp:**

```
┌─────────────────────────────────────┐
│     Lớp khách hàng (Giao diện)      │
│  React - Giao diện người dùng      │
│  - Thành phần                       │
│  - Trang                           │
│  - Quản lý trạng thái              │
└────────────┬────────────────────────┘
             │ Yêu cầu/Phản hồi
┌────────────▼────────────────────────┐
│   Lớp máy chủ (Ứng dụng)            │
│  Node.js + Express - Máy chủ       │
│  - Tuyến & Điều khiển              │
│  - Middleware (Phần mềm trung gian)             │
│  - Logic kinh doanh                 │
└────────────┬────────────────────────┘
             │ Truy vấn/Kết quả
┌────────────▼────────────────────────┐
│   Lớp dữ liệu (Cơ sở dữ liệu)      │
│  MySQL - Lưu trữ dữ liệu           │
│  - Người dùng, Công thức           │
│  - Bình luận, Đánh giá             │
└─────────────────────────────────────┘
```

**Lược đồ Cơ sở dữ liệu:**

```
người_dùng
├── mã (Khóa chính)
├── thư điện tử (Duy nhất)
├── mật khẩu (mã hóa)
├── tên đầy đủ
└── vai trò

công_thức
├── mã (Khóa chính)
├── mã_người dùng (Khóa ngoài)
├── tiêu đề
├── nguyên liệu
├── các bước
├── đường dẫn hình ảnh
├── ngày tạo
└── ngày cập nhật

đánh_giá
├── mã (Khóa chính)
├── mã_công thức (Khóa ngoài)
├── mã_người dùng (Khóa ngoài)
├── xếp hạng (1-5)
└── ngày tạo

yêu_thích
├── mã (Khóa chính)
├── mã_công thức (Khóa ngoài)
└── mã_người dùng (Khóa ngoài)

bình_luận
├── mã (Khóa chính)
├── mã_công thức (Khóa ngoài)
├── mã_người dùng (Khóa ngoài)
├── nội dung
└── ngày tạo
```

---

### 3.2 Cài Đặt Chương Trình

#### 3.2.1 Công Nghệ Sử Dụng

| Thành phần | Công nghệ | Phiên bản |
|-----------|-----------|---------|
| **Giao diện** | React | 19.x |
| | Bộ định tuyến React | 6.x |
| | Axios (Thư viện HTTP) | 1.x |
| | CSS (Kiểu dáng) | Tiêu chuẩn |
| **Máy chủ ứng dụng** | Node.js | 16.x+ |
| | Express | 4.x |
| | JSON Web Token (JWT) | jsonwebtoken |
| | Bcrypt | bcryptjs |
| **Cơ sở dữ liệu** | MySQL | 8.0+ |
| **Lưu trữ** | Lưu trữ đám mây | Dịch vụ đám mây |
| **Công cụ** | Trình quản lý gói | Trình quản lý gói nút |

#### 3.2.2 Cấu Trúc Dự Án

```
DoAnChuyenNganh/
├── src/
│   ├── backend/
│   │   ├── config/
│   │   │   ├── db.js              - MySQL connection config
│   │   │   └── cloudinary.js      - Image upload config
│   │   ├── middleware/            - Middleware (phần mềm trung gian)
│   │   │   └── auth.js            - JWT verification & authorization
│   │   ├── routes/
│   │   │   ├── auth.js            - Login, Register endpoints
│   │   │   ├── recipe.js          - Recipe CRUD & Search endpoints
│   │   │   ├── rating.js          - Rating endpoints
│   │   │   ├── favorite.js        - Favorite endpoints
│   │   │   └── admin.js           - Admin routes
│   │   ├── scripts/
│   │   │   └── (database setup & migration scripts)
│   │   ├── uploads/               - Temporary image storage
│   │   ├── server.js              - Main server file
│   │   ├── package.json           - Dependencies
│   │   └── .env                   - Environment variables
│   │
│   └── cookshare/                 - React Frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── Navbar.jsx     - Navigation bar
│       │   │   └── ProtectedRoute.jsx
│       │   ├── pages/
│       │   │   ├── Home.jsx       - Home page
│       │   │   ├── CreateRecipe.jsx
│       │   │   ├── RecipeDetail.jsx
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── MyRecipes.jsx
│       │   │   ├── FavoriteRecipes.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   └── ... (other pages)
│       │   ├── App.js             - Main component
│       │   └── App.css            - Global styles
│       ├── public/
│       └── package.json
│
└── luận văn/
    └── BáoCáo.md                  - Báo cáo đồ án
```

#### 3.2.3 Các Thành Phần Chính

**Backend - server.js**
```
- Initialize Express server
- Configure CORS (Chia sẻ tài nguyên Cross-Origin) and Middleware
- Connect to MySQL database
- Mount routes
- Run server on port 3001
```

**Backend - Middleware (phần mềm trung gian) (middleware/auth.js)**
```
- Verify JSON Web Token (JWT)
- Check admin privileges
- Handle authorization errors
```

**Backend - Routes (routes/auth.js)**
```
POST - /auth/register
  - Validate: email, password
  - Check if email exists
  - Hash password, save to database
  
POST - /auth/login
  - Find user by email
  - Verify password
  - Create JSON Web Token (JWT)
  - Return JWT & user info
```

**Backend - Routes (routes/recipe.js)**
```
GET - /recipe/list
  - Get all recipes with user info
  
GET - /recipe/search?q=keyword
  - Search recipes by title/ingredients
  
POST - /recipe/create
  - Require authentication
  - Upload image to Cloudinary
  - Save recipe to database
  
PUT - /recipe/update/:id
  - Verify owner
  - Update recipe fields
  
DELETE - /recipe/delete/:id
  - Verify owner or admin
  - Delete from database
```

**Frontend - Components (components/Navbar.jsx)**
```
- Display application logo/name
- Login/Register buttons (if not logged in)
- Username + Logout button (if logged in)
- Admin dashboard link (if admin)
```

**Frontend - Pages (pages/Home.jsx)**
```
- Display recipe list
- Search bar for searching
- Create recipe button (if logged in)
- Responsive grid layout
```

---

### 3.3 Kết Quả Hiện Thực Hóa

#### 3.3.1 Các Chức Năng Đã Triển Khai

✅ **Xác thực & Quản lý Người dùng:**
- Đăng ký với xác thực (thư điện tử, mật khẩu)
- Đăng nhập với mã thông báo (hết hạn 7 ngày)
- Đăng xuất
- Xác minh vai trò quản trị viên
- Hồ sơ người dùng (xem thông tin)

✅ **Quản lý Công Thức:**
- Tạo công thức (tiêu đề, nguyên liệu, bước, tải lên ảnh)
- Danh sách công thức với phân trang
- Xem chi tiết công thức
- Chỉnh sửa công thức (chỉ chủ sở hữu) - chỉnh sửa văn bản & hình ảnh
- Xóa công thức (chủ sở hữu hoặc quản trị viên)
- Tìm kiếm công thức theo từ khóa
- Tải lên hình ảnh lên lưu trữ đám mây

✅ **Tương Tác & Bình Luận:**
- Bình luận trên công thức (tạo, xem, xóa của chủ sở hữu)
- Xếp hạng sao (1-5 sao)
- Người dùng chỉ được đánh giá 1 lần
- Xem thống kê đánh giá
- Biểu đồ thống kê đánh giá

✅ **Yêu Thích:**
- Thêm/Loại bỏ công thức yêu thích
- Xem danh sách công thức yêu thích
- Hiển thị số lượt thích

✅ **Bảng Điều Khiển Quản Trị:**
- Xem tất cả công thức (định dạng bảng)
- Xem tất cả người dùng (định dạng bảng)
- Xóa công thức (bất kỳ công thức nào)
- Xóa người dùng
- Thẻ thống kê (tổng công thức, người dùng, đánh giá)
- Bảng đáp ứng

#### 3.3.2 Hồ Sơ Thiết Kế

**Thiết Kế Cơ Sở Dữ Liệu:**
- 5 bảng chính: người dùng, công thức, đánh giá, yêu thích, bình luận
- Mối quan hệ: Khóa ngoài kết nối người dùng và công thức
- Chỉ mục trên thư điện tử, mã_người dùng, mã_công thức để tối ưu truy vấn

**Thiết Kế Dịch Vụ Web:**
- Tuân theo nguyên tắc dịch vụ web theo kiểu tài nguyên
- Phương pháp tiêu chuẩn (Lấy, Đăng, Đặt, Xóa)
- Phản hồi lỗi nhất quán
- Authorization header (Tiêu đề `Authorization` chứa JWT)

**Thiết Kế Giao diện/Trải nghiệm:**
- Bảng màu: Nền chuyển tiếp (cam, hồng, tím)
- Chữ: Phân cấp rõ ràng
- Khoảng cách: Đệm/lề nhất quán
- Biểu tượng: Biểu tượng cảm xúc hấp dẫn
- Hoạt ảnh: Chuyển đổi mượt, hiệu ứng di chuột

#### 3.3.3 Giao Diện Người Dùng

**Trang Chủ:**
- Thanh điều hướng với logo, thanh tìm kiếm, menu người dùng
- Lưới các thẻ công thức
- Mỗi thẻ hiển thị: hình ảnh, tiêu đề, tác giả, xếp hạng
- Nút tạo công thức mới

**Trang Tạo Công Thức:**
- Biểu mẫu nhập: Tiêu đề, Nguyên liệu, Các bước
- Nút tải lên hình ảnh
- Nút gửi

**Trang Chi Tiết Công Thức:**
- Hình ảnh công thức lớn
- Tiêu đề, tác giả, ngày tạo
- Danh sách nguyên liệu
- Hướng dẫn các bước
- Phần xếp hạng (sao, biểu đồ)
- Phần bình luận
- Nút yêu thích
- Nút chỉnh sửa/xóa (nếu chủ sở hữu hoặc quản trị viên)

**Bảng Điều Khiển Quản Trị:**
- Điều hướng thanh bên
- Thẻ thống kê
- Bảng công thức (với tùy chọn xóa)
- Bảng người dùng (với tùy chọn xóa)
- Thiết kế đáp ứng

**Thiết Kế Đáp Ứng:**
- Di động: Bố cục xếp chồng, một cột
- Máy tính bảng: Lưới 2 cột
- Máy tính để bàn: Lưới 3-4 cột
- Menu thanh trên di động

---

## KẾT LUẬN

Trong quá trình thực hiện đồ án, chúng tôi đã thành công xây dựng một nền tảng web chia sẻ công thức nấu ăn đầy đủ và chức năng. Hệ thống CookShare cung cấp cho người dùng một trải nghiệm tương tác cao, an toàn, và dễ sử dụng.

**Các kết quả chính đạt được:**

1. **Hoàn thành toàn bộ 7 nhiệm vụ đã lên kế hoạch**
   - Xây dựng hệ thống xác thực an toàn
   - Tạo middleware xác thực riêng để tái sử dụng
   - Triển khai dịch vụ chỉnh sửa công thức, tìm kiếm, và hệ thống xếp hạng
   - Cải thiện xử lý lỗi và giao diện/trải nghiệm

2. **Hệ thống Bảo mật**
   - Mã hóa mật khẩu bằng Bcrypt
   - JWT có hạn 7 ngày
   - Middleware xác thực cho các điểm cuối nhạy cảm
   - Phân quyền người dùng/quản trị viên rõ ràng

3. **Tính Năng Hoàn Chỉnh**
   - 12+ điểm cuối dịch vụ cho các chức năng chính
   - Hệ thống xếp hạng/nhận xét với thống kê chi tiết
   - Chức năng yêu thích/thích
   - Hệ thống bình luận
   - Bảng điều khiển quản trị quản lý

4. **Giao Diện Đáp Ứng**
   - Hỗ trợ máy tính để bàn, máy tính bảng, di động
   - Nền chuyển tiếp và hoạt ảnh
   - Điều hướng thân thiện với người dùng
   - Thông báo lỗi rõ ràng

**Hướng Phát Triển Tiếp Theo:**

1. **Mở Rộng Tính Năng**
   - Thêm hướng dẫn video
   - Chia sẻ xã hội
   - Yêu cầu công thức từ cộng đồng
   - Tính năng theo dõi người dùng

2. **Tối Ưu Hóa Hiệu Suất**
   - Triển khai bộ đệm
   - Chỉ mục cơ sở dữ liệu
   - Tối ưu hóa hình ảnh
   - Giới hạn tỷ lệ yêu cầu

3. **Trí Tuệ Nhân Tạo**
   - Hệ thống đề xuất dựa trên sở thích người dùng
   - Gắn thẻ tự động công thức
   - Tính toán dinh dưỡng

4. **Ứng Dụng Di Động**
   - Ứng dụng di động cho các hệ điều hành
   - Chế độ ngoại tuyến
   - Thông báo đẩy

5. **Hoạt Động & Triển Khai**
   - Chứa đựng công nghệ
   - Đường ống tích hợp liên tục/triển khai liên tục
   - Triển khai dịch vụ đám mây
   - Giám sát & Ghi nhật ký

---

## TÀI LIỆU THAM KHẢO

1. Tài Liệu Chính Thức React
   - Tài liệu chính thức về React

2. Tài Liệu Express
   - Hướng dẫn khung web Express

3. Tài Liệu MySQL
   - Tài liệu về MySQL 8.0

4. JSON Web Token (JWT)
   - Giới thiệu và thông số kỹ thuật JSON Web Token (JWT)

5. Tài Liệu Bcrypt
   - Hướng dẫn sử dụng Bcrypt

6. Tài Liệu Lưu Trữ Đám Mây
   - Hướng dẫn tích hợp lưu trữ đám mây

7. Thiết Kế Web Đáp Ứng
   - Hướng dẫn thiết kế web đáp ứng

8. Thiết Kế Dịch Vụ Web
   - Nguyên tắc thiết kế dịch vụ web theo kiểu tài nguyên

9. Bảo Mật Web
   - Hướng dẫn bảo mật web hiện đại

10. Thực Hành Tốt Nhất Phát Triển
    - Hướng dẫn thực hành tốt nhất phát triển phần mềm
