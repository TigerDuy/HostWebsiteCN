# ✅ CHECKLIST - ĐỦ ĐIỀU KIỆN CHẠY

## 📋 CỐI ĐẠT

### Environment Variables
```bash
# backend/.env
☑️ DB_HOST=localhost
☑️ DB_USER=root
☑️ DB_PASSWORD=yourpassword
☑️ DB_NAME=cooking_app
☑️ DB_PORT=3306
☑️ CLOUDINARY_NAME=your_name
☑️ CLOUDINARY_API_KEY=your_key
☑️ CLOUDINARY_API_SECRET=your_secret
```

### Database
```
☑️ MySQL server chạy
☑️ Database "cooking_app" tạo
☑️ Tables được import từ database.sql
☑️ 5 tables: nguoi_dung, cong_thuc, binh_luan, favorite, danh_gia
```

### Backend Dependencies
```
☑️ npm install (backend/)
☑️ Node.js v16+
☑️ Express.js
☑️ mysql2
☑️ bcrypt
☑️ jsonwebtoken
☑️ multer
☑️ cloudinary
☑️ cors
☑️ dotenv
```

### Frontend Dependencies
```
☑️ npm install (cookshare/)
☑️ React 19
☑️ React Router v7
☑️ Axios
☑️ CSS3
```

---

## 🚀 CHẠY SERVERS

### Backend
```bash
cd backend
☑️ npm start
☑️ Server chạy tại http://localhost:3001
☑️ Kiểm tra console log không có error
```

### Frontend
```bash
cd cookshare
☑️ npm start
☑️ App chạy tại http://localhost:3000
☑️ Mở browser, trang Home load bình thường
```

---

## 📝 FEATURES CHECK

### Authentication
```
☑️ Trang /register tạo được tài khoản
☑️ Trang /login đăng nhập được
☑️ Token lưu vào localStorage
☑️ Navbar hiển thị username
☑️ Nút đăng xuất hoạt động
☑️ Token expiration 7 days
```

### Recipes
```
☑️ Trang Home hiển thị danh sách công thức
☑️ Search bar tìm kiếm được
☑️ Trang Create Recipe tạo được
☑️ Upload ảnh được (Cloudinary)
☑️ Trang Detail hiển thị công thức
☑️ Trang MyRecipes xem được công thức của mình
☑️ Edit công thức hoạt động
☑️ Delete công thức hoạt động
```

### Ratings
```
☑️ Star rating component hiển thị
☑️ Có thể đánh giá 1-5 sao
☑️ Hiển thị trung bình sao
☑️ Hiển thị biểu đồ đánh giá
☑️ Tổng số đánh giá đúng
☑️ User chỉ đánh giá 1 lần (có thể update)
```

### Favorites
```
☑️ Nút favorite hoạt động
☑️ Heart icon đổi màu
☑️ Có thể hủy favorite
☑️ Danh sách yêu thích lưu được
```

### Comments
```
☑️ Có thể bình luận
☑️ Bình luận hiển thị dưới
☑️ Hiển thị tên người dùng
☑️ Danh sách bình luận sắp xếp đúng
```

### Admin
```
☑️ Route /admin chỉ admin vào được
☑️ Hiển thị danh sách công thức
☑️ Hiển thị danh sách users
☑️ Có thể xóa công thức
☑️ Có thể xóa users
☑️ Thống kê đúng (số users, số recipes)
```

---

## 🎨 UI/UX CHECK

### Responsive Design
```
☑️ Desktop (1920px) hiển thị đúng
☑️ Tablet (768px) responsive
☑️ Mobile (375px) responsive
☑️ Không có horizontal scroll
☑️ Fonts readable trên mọi size
```

### Styling
```
☑️ Gradient backgrounds
☑️ Smooth transitions
☑️ Hover effects
☑️ Icons emojis
☑️ Consistent colors
☑️ Shadow effects
☑️ Border radius
```

### User Experience
```
☑️ Loading states hiển thị
☑️ Error messages rõ ràng
☑️ Success messages
☑️ Confirm dialogs
☑️ No layout shift
☑️ Fast interactions
```

---

## 🔒 SECURITY CHECK

### Authentication
```
☑️ JWT token được verify
☑️ Password được hash (bcrypt)
☑️ Logout xóa token
☑️ Protected routes redirect login
☑️ Admin route protected
```

### Data Validation
```
☑️ Email validation
☑️ Password minimum 6 chars
☑️ Username không blank
☑️ Rating 1-5
☑️ Image size validation
```

### Database
```
☑️ Foreign keys đúng
☑️ Unique constraints
☑️ Delete cascade
☑️ No SQL injection
```

---

## 📊 API ENDPOINTS TEST

### Auth
```
☑️ POST /auth/register ✅
☑️ POST /auth/login ✅
```

### Recipes (8)
```
☑️ GET /recipe/list ✅
☑️ GET /recipe/detail/:id ✅
☑️ GET /recipe/search?q= ✅
☑️ POST /recipe/create ✅
☑️ PUT /recipe/update/:id ✅
☑️ DELETE /recipe/delete/:id ✅
☑️ GET /recipe/my ✅
☑️ POST/GET /recipe/comment ✅
```

### Favorites (4)
```
☑️ POST /favorite/:id ✅
☑️ DELETE /favorite/:id ✅
☑️ GET /favorite/list ✅
☑️ GET /favorite/check/:id ✅
```

### Ratings (4)
```
☑️ POST /rating/:id ✅
☑️ GET /rating/:id ✅
☑️ GET /rating/stats/:id ✅
☑️ GET /rating/user/:id ✅
```

### Admin (4)
```
☑️ GET /admin/recipes ✅
☑️ GET /admin/users ✅
☑️ DELETE /admin/delete/:id ✅
☑️ DELETE /admin/user/:id ✅
```

---

## 🐛 TROUBLESHOOTING COMMON ISSUES

### Error: "Cannot connect to database"
```
☑️ Check MySQL running: mysql -u root -p
☑️ Check DB_HOST in .env
☑️ Check DB_USER & DB_PASSWORD
☑️ Check database "cooking_app" exists
```

### Error: "CORS error"
```
☑️ Check cors() in server.js
☑️ Check API URL in frontend
☑️ Check backend port 3001
```

### Error: "Image upload fails"
```
☑️ Check Cloudinary API keys
☑️ Check .env file
☑️ Check file permissions
☑️ Check image format (jpg, png)
```

### Error: "404 Not Found"
```
☑️ Check routes in server.js
☑️ Check backend running
☑️ Check correct port
☑️ Check API endpoint spelling
```

### Error: "Token invalid"
```
☑️ Check JWT_SECRET same everywhere
☑️ Check token not expired
☑️ Check Authorization header format
☑️ Check localStorage.getItem("token")
```

---

## 📱 BROWSER COMPATIBILITY

```
☑️ Chrome ✅
☑️ Firefox ✅
☑️ Safari ✅
☑️ Edge ✅
☑️ Mobile Safari ✅
☑️ Chrome Mobile ✅
```

---

## 🎯 FINAL VERIFICATION

- [ ] All files created/updated ✅
- [ ] Dependencies installed ✅
- [ ] Database created ✅
- [ ] Backend running ✅
- [ ] Frontend running ✅
- [ ] Can register ✅
- [ ] Can login ✅
- [ ] Can create recipe ✅
- [ ] Can edit recipe ✅
- [ ] Can search ✅
- [ ] Can rate ✅
- [ ] Can favorite ✅
- [ ] Can comment ✅
- [ ] Admin dashboard works ✅
- [ ] Responsive on mobile ✅
- [ ] No errors in console ✅
- [ ] No errors in network tab ✅
- [ ] All documentation ready ✅

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:

```
☑️ Add .env file with secrets
☑️ Use environment variables
☑️ Set secure JWT secret
☑️ Use strong passwords
☑️ Enable HTTPS
☑️ Add rate limiting
☑️ Add request logging
☑️ Setup error tracking
☑️ Optimize images
☑️ Minify CSS/JS
☑️ Setup CDN
☑️ Database backups
☑️ Monitor performance
☑️ Security audit
```

---

## ✨ SUCCESS INDICATORS

✅ **If all items checked above are green, your project is ready!**

🎉 **Congratulations!** 🎉
Your CookShare is fully functional and production-ready.

---

**Last Updated**: November 11, 2025
**Status**: ✅ COMPLETE & VERIFIED
