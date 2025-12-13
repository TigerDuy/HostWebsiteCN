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

// ✅ Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password"
  }
});

// ✅ Store OTP tạm thời (trong production nên lưu vào Redis)
const otpStore = {};

// ✅ TEST gửi email (để kiểm tra cấu hình)
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
      message: "✅ Email test thành công!",
      emailUser: process.env.EMAIL_USER
    });
  });
});

// ✅ ĐĂNG KÝ
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // ✅ Validate input
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

    db.query(
      "INSERT INTO nguoi_dung (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "❌ Email hoặc tên đăng nhập đã tồn tại!" });
          }
          return res.status(500).json({ message: "❌ Lỗi server: " + err.message });
        }
        return res.json({ message: "✅ Đăng ký thành công!" });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

// ✅ ĐĂNG NHẬP
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // ✅ Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu không được để trống!" });
  }

  db.query(
    "SELECT * FROM nguoi_dung WHERE email = ?",
    [email],
    async (err, result) => {
      if (err || result.length === 0) {
        return res.status(400).json({ message: "Email không tồn tại!" });
      }

      const user = result[0];

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ message: "Sai mật khẩu!" });
      }

      // ✅ Thêm role vào JWT payload
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
    }
  );
});

// ✅ QUÊN MẬT KHẨU - STEP 1: Gửi OTP
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Vui lòng nhập email!" });
  }

  // Kiểm tra email có tồn tại không
  db.query(
    "SELECT id, username FROM nguoi_dung WHERE email = ?",
    [email],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(400).json({ message: "Email không tồn tại trong hệ thống!" });
      }

      // Tạo OTP ngẫu nhiên 6 chữ số
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Lưu OTP vào store với thời gian hết hạn 10 phút
      otpStore[email] = {
        otp: otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0
      };

      // Gửi email OTP
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
        return res.json({ message: "✅ OTP đã được gửi đến email của bạn!" });
      });
    }
  );
});

// ✅ QUÊN MẬT KHẨU - STEP 2: Xác nhận OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email và OTP không được để trống!" });
  }

  // Kiểm tra OTP
  if (!otpStore[email]) {
    return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn!" });
  }

  const storedOTP = otpStore[email];

  // Kiểm tra thời gian hết hạn
  if (Date.now() > storedOTP.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP đã hết hạn! Vui lòng yêu cầu OTP mới." });
  }

  // Kiểm tra OTP có khớp không
  if (storedOTP.otp !== otp) {
    storedOTP.attempts += 1;
    if (storedOTP.attempts >= 5) {
      delete otpStore[email];
      return res.status(400).json({ message: "Quá nhiều lần nhập sai! Vui lòng yêu cầu OTP mới." });
    }
    return res.status(400).json({ message: "OTP không chính xác!" });
  }

  // OTP chính xác, trả về token tạm thời
  const tempToken = jwt.sign({ email, verified: true }, TEMP_SECRET, { expiresIn: "15m" });
  
  // Xóa OTP sau khi xác nhận
  delete otpStore[email];

  return res.json({
    message: "✅ OTP xác nhận thành công!",
    tempToken: tempToken
  });
});

// ✅ QUÊN MẬT KHẨU - STEP 3: Đặt lại mật khẩu
router.post("/reset-password", (req, res) => {
  const { email, newPassword, tempToken } = req.body;

  if (!email || !newPassword || !tempToken) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
  }

  try {
    // Xác nhận token tạm thời
    const decoded = jwt.verify(tempToken, TEMP_SECRET);
    
    if (decoded.email !== email || !decoded.verified) {
      return res.status(400).json({ message: "Token không hợp lệ!" });
    }

    // Hash mật khẩu mới
    bcrypt.hash(newPassword, 10, (err, hashed) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi mã hóa mật khẩu!" });
      }

      // Cập nhật mật khẩu trong database
      db.query(
        "UPDATE nguoi_dung SET password = ? WHERE email = ?",
        [hashed, email],
        (err, result) => {
          if (err || result.affectedRows === 0) {
            return res.status(500).json({ message: "Lỗi cập nhật mật khẩu!" });
          }

          return res.json({ message: "✅ Mật khẩu đã được đặt lại thành công!" });
        }
      );
    });
  } catch (err) {
    return res.status(400).json({ message: "Token hết hạn hoặc không hợp lệ!" });
  }
});

// ✅ LẤY THÔNG TIN PROFILE PUBLIC (không cần token)
router.get("/public-profile/:userId", (req, res) => {
  const { userId } = req.params;

  db.query(
    "SELECT id, username, avatar_url, bio FROM nguoi_dung WHERE id = ?",
    [userId],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(400).json({ message: "Người dùng không tồn tại!" });
      }

      return res.json(result[0]);
    }
  );
});

// ✅ LẤY THÔNG TIN PROFILE
router.get("/profile/:userId", verifyToken, (req, res) => {
  // req.user được set bởi middleware verifyToken
  const { userId } = req.params;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ message: "❌ Bạn không có quyền truy cập!" });
  }

  db.query(
    "SELECT id, username, email, role, avatar_url, bio FROM nguoi_dung WHERE id = ?",
    [userId],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(400).json({ message: "Người dùng không tồn tại!" });
      }

      return res.json(result[0]);
    }
  );
});

// ✅ CẬP NHẬT THÔNG TIN PROFILE
router.put("/profile/:userId", verifyToken, (req, res) => {
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

  db.query(
    "UPDATE nguoi_dung SET username = ?, email = ?, avatar_url = ?, bio = ? WHERE id = ?",
    [username, email, avatar_url || null, bio || null, userId],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email hoặc tên đăng nhập đã được sử dụng!" });
        }
        return res.status(500).json({ message: "Lỗi cập nhật thông tin!" });
      }

      // Trả về thông tin người dùng sau cập nhật
      db.query(
        "SELECT id, username, email, role, avatar_url, bio FROM nguoi_dung WHERE id = ?",
        [userId],
        (err, result) => {
          if (err || result.length === 0) {
            return res.status(500).json({ message: "Lỗi lấy thông tin cập nhật!" });
          }
          return res.json(result[0]);
        }
      );
    }
  );
});

// ✅ ĐỔI MẬT KHẨU
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
    // Lấy mật khẩu hiện tại từ database
    db.query(
      "SELECT password FROM nguoi_dung WHERE id = ?",
      [userId],
      async (err, result) => {
        if (err || result.length === 0) {
          return res.status(400).json({ message: "Người dùng không tồn tại!" });
        }

        const userRecord = result[0];

        // Kiểm tra mật khẩu hiện tại
        const match = await bcrypt.compare(currentPassword, userRecord.password);
        if (!match) {
          return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác!" });
        }

        // Hash mật khẩu mới
        const hashed = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới
        db.query(
          "UPDATE nguoi_dung SET password = ? WHERE id = ?",
          [hashed, userId],
          (err, result) => {
            if (err) {
              return res.status(500).json({ message: "Lỗi đổi mật khẩu!" });
            }

            return res.json({ message: "✅ Đổi mật khẩu thành công!" });
          }
        );
      }
    );
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

// ✅ UPLOAD AVATAR
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
    db.query(
      "UPDATE nguoi_dung SET avatar_url = ? WHERE id = ?",
      [avatarUrl, userId],
      (err) => {
        if (err) {
          return res.status(500).json({ message: "❌ Lỗi cập nhật avatar!" });
        }
        return res.json({ message: "✅ Upload avatar thành công!", avatar_url: avatarUrl });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

module.exports = router;
