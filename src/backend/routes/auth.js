const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require("nodemailer");

require("dotenv").config();
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

const SECRET_KEY = process.env.SECRET_KEY || process.env.JWT_SECRET || "SECRET_KEY";
const TEMP_SECRET = process.env.TEMP_SECRET || "TEMP_SECRET";

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password"
  }
});

// Store OTP tạm thời (trong production nên lưu vào Redis)
const otpStore = {};

// TEST gửi email (để kiểm tra cấu hình)
router.post("/test-email", (req, res) => {
  const testEmail = "test@example.com";
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: testEmail,
    subject: "Test Email",
    html: "<h1>Test Email Success!</h1>"
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("Email test error:", err);
      return res.status(500).json({ 
        message: "Lỗi gửi email: " + err.message,
        emailUser: process.env.EMAIL_USER,
        hasPassword: !!process.env.EMAIL_PASSWORD
      });
    }
    return res.json({ 
      message: "Email test thành công!",
      emailUser: process.env.EMAIL_USER
    });
  });
});

// ĐĂNG KÝ
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validate input
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "❌ Vui lòng điền đầy đủ thông tin!" });
  }

  if (username.length < 3) {
    return res.status(400).json({ message: "❌ Tên đăng nhập phải có ít nhất 3 ký tự!" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "❌ Email không hợp lệ!" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "❌ Mật khẩu phải có ít nhất 6 ký tự!" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "❌ Mật khẩu không trùng khớp!" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO nguoi_dung (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashed]
    );
    return res.json({ message: "Đăng ký thành công!" });
  } catch (err) {
    if (err.code === "23505") { // PostgreSQL unique violation
      return res.status(400).json({ message: "❌ Email hoặc tên đăng nhập đã tồn tại!" });
    }
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// ĐĂNG NHẬP
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu không được để trống!" });
  }

  try {
    const result = await db.query("SELECT * FROM nguoi_dung WHERE email = $1", [email]);
    
    if (result.length === 0) {
      return res.status(400).json({ message: "Email không tồn tại!" });
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return res.status(400).json({ message: "Sai mật khẩu!" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      SECRET_KEY, 
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Đăng nhập thành công!",
      token,
      username: user.username,
      role: user.role,
      userId: user.id,
      avatar_url: user.avatar_url || ""
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// KIỂM TRA ROLE HIỆN TẠI (để phát hiện thay đổi role)
router.get("/check-role", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const tokenRole = req.user.role;

  try {
    const result = await db.query("SELECT role FROM nguoi_dung WHERE id = $1", [userId]);
    
    if (result.length === 0) {
      return res.status(401).json({ message: "Tài khoản không tồn tại!", forceLogout: true });
    }

    const currentRole = result[0].role;

    if (currentRole !== tokenRole) {
      return res.status(401).json({
        message: "Vai trò của bạn đã thay đổi. Vui lòng đăng nhập lại!",
        forceLogout: true,
        oldRole: tokenRole,
        newRole: currentRole
      });
    }

    return res.json({ role: currentRole, valid: true });
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// QUÊN MẬT KHẨU - STEP 1: Gửi OTP
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Vui lòng nhập email!" });
  }

  try {
    const result = await db.query(
      "SELECT id, username FROM nguoi_dung WHERE email = $1",
      [email]
    );

    if (result.length === 0) {
      return res.status(400).json({ message: "Email không tồn tại trong hệ thống!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    otpStore[email] = {
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "Mã xác nhận đặt lại mật khẩu - Ứng dụng nấu ăn",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Đặt lại mật khẩu</h2>
          <p>Xin chào <strong>${result[0].username}</strong>,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP dưới đây:</p>
          <div style="background: #ff7f50; color: white; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="color: #666;">Mã OTP này sẽ hết hạn trong 10 phút.</p>
          <p style="color: #666;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Email error:", err);
        return res.status(500).json({ message: "Lỗi gửi email. Vui lòng thử lại sau!" });
      }
      return res.json({ message: "OTP đã được gửi đến email của bạn!" });
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// QUÊN MẬT KHẨU - STEP 2: Xác nhận OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email và OTP không được để trống!" });
  }

  if (!otpStore[email]) {
    return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn!" });
  }

  const storedOTP = otpStore[email];

  if (Date.now() > storedOTP.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP đã hết hạn! Vui lòng yêu cầu OTP mới." });
  }

  if (storedOTP.otp !== otp) {
    storedOTP.attempts += 1;
    if (storedOTP.attempts >= 5) {
      delete otpStore[email];
      return res.status(400).json({ message: "Quá nhiều lần nhập sai! Vui lòng yêu cầu OTP mới." });
    }
    return res.status(400).json({ message: "OTP không chính xác!" });
  }

  const tempToken = jwt.sign({ email, verified: true }, TEMP_SECRET, { expiresIn: "15m" });
  delete otpStore[email];

  return res.json({
    message: "OTP xác nhận thành công!",
    tempToken: tempToken
  });
});

// QUÊN MẬT KHẨU - STEP 3: Đặt lại mật khẩu
router.post("/reset-password", async (req, res) => {
  const { email, newPassword, tempToken } = req.body;

  if (!email || !newPassword || !tempToken) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
  }

  try {
    const decoded = jwt.verify(tempToken, TEMP_SECRET);
    
    if (decoded.email !== email || !decoded.verified) {
      return res.status(400).json({ message: "Token không hợp lệ!" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const result = await db.query(
      "UPDATE nguoi_dung SET password = $1 WHERE email = $2",
      [hashed, email]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Lỗi cập nhật mật khẩu!" });
    }

    return res.json({ message: "Mật khẩu đã được đặt lại thành công!" });
  } catch (err) {
    return res.status(400).json({ message: "Token hết hạn hoặc không hợp lệ!" });
  }
});

// LẤY THÔNG TIN PROFILE PUBLIC (không cần token)
router.get("/public-profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query(
      "SELECT id, username, avatar_url, bio FROM nguoi_dung WHERE id = $1",
      [userId]
    );

    if (result.length === 0) {
      return res.status(400).json({ message: "Người dùng không tồn tại!" });
    }

    return res.json(result[0]);
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// LẤY THÔNG TIN PROFILE
router.get("/profile/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ message: "❌ Bạn không có quyền truy cập!" });
  }

  try {
    const result = await db.query(
      "SELECT id, username, email, role, avatar_url, bio FROM nguoi_dung WHERE id = $1",
      [userId]
    );

    if (result.length === 0) {
      return res.status(400).json({ message: "Người dùng không tồn tại!" });
    }

    return res.json(result[0]);
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// CẬP NHẬT THÔNG TIN PROFILE
router.put("/profile/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { username, email, avatar_url, bio } = req.body;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ message: "❌ Bạn không có quyền truy cập!" });
  }

  if (!username || !email) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
  }

  if (username.length < 3) {
    return res.status(400).json({ message: "Tên đăng nhập phải có ít nhất 3 ký tự!" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  try {
    await db.query(
      "UPDATE nguoi_dung SET username = $1, email = $2, avatar_url = $3, bio = $4 WHERE id = $5",
      [username, email, avatar_url || null, bio || null, userId]
    );

    const result = await db.query(
      "SELECT id, username, email, role, avatar_url, bio FROM nguoi_dung WHERE id = $1",
      [userId]
    );

    if (result.length === 0) {
      return res.status(500).json({ message: "Lỗi lấy thông tin cập nhật!" });
    }

    return res.json(result[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email hoặc tên đăng nhập đã được sử dụng!" });
    }
    res.status(500).json({ message: "Lỗi cập nhật thông tin!" });
  }
});

// ĐỔI MẬT KHẨU
router.post("/change-password/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ message: "❌ Bạn không có quyền truy cập!" });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ mật khẩu!" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
  }

  try {
    const result = await db.query("SELECT password FROM nguoi_dung WHERE id = $1", [userId]);

    if (result.length === 0) {
      return res.status(400).json({ message: "Người dùng không tồn tại!" });
    }

    const match = await bcrypt.compare(currentPassword, result[0].password);
    if (!match) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác!" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE nguoi_dung SET password = $1 WHERE id = $2", [hashed, userId]);

    return res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

// UPLOAD AVATAR
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

const upload = multer({ dest: "uploads/" });

router.post("/profile/:userId/avatar", verifyToken, upload.single("avatar"), async (req, res) => {
  const { userId } = req.params;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ message: "❌ Bạn không có quyền truy cập!" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "❌ Vui lòng chọn file ảnh!" });
  }

  let avatarUrl = null;

  try {
    // Try Cloudinary first
    try {
      const uploadImg = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
      avatarUrl = uploadImg.secure_url;
      fs.unlink(req.file.path, () => {});
    } catch (uploadErr) {
      console.warn("⚠️  Cloudinary upload failed, attempt local fallback:", uploadErr.message);
      // Local fallback
      try {
        const ext = path.extname(req.file.originalname) || ".jpg";
        const newName = req.file.filename + ext;
        const target = path.join(__dirname, "..", "uploads", newName);
        fs.renameSync(req.file.path, target);
        avatarUrl = `http://localhost:3001/uploads/${newName}`;
      } catch (localErr) {
        console.warn("⚠️  Local fallback failed:", localErr.message);
        try { fs.unlinkSync(req.file.path); } catch(e){}
        return res.status(500).json({ message: "❌ Lỗi upload avatar!" });
      }
    }

    // Update database
    await db.query("UPDATE nguoi_dung SET avatar_url = $1 WHERE id = $2", [avatarUrl, userId]);
    return res.json({ message: "Upload avatar thành công!", avatar_url: avatarUrl });
  } catch (err) {
    return res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

module.exports = router;
