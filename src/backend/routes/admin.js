const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const { verifyToken, verifyAdmin, verifyAdminOrModerator } = require("../middleware/auth");
const router = express.Router();

// ✅ API lấy danh sách công thức (Admin)
router.get("/recipes", verifyAdminOrModerator(db), (req, res) => {
  db.query(
    `SELECT 
      cong_thuc.*,
      nguoi_dung.username,
      nguoi_dung.avatar_url,
      COALESCE(AVG(danh_gia.rating), 0) as avg_rating,
      COUNT(DISTINCT danh_gia.id) as rating_count,
      COUNT(DISTINCT favorite.id) as favorite_count
    FROM cong_thuc 
    JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id
    LEFT JOIN danh_gia ON cong_thuc.id = danh_gia.recipe_id
    LEFT JOIN favorite ON cong_thuc.id = favorite.recipe_id
    GROUP BY cong_thuc.id
    ORDER BY cong_thuc.created_at DESC`,
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi lấy danh sách công thức!" });
      res.json(result);
    }
  );
});

// ✅ API lấy danh sách người dùng (Admin)
router.get("/users", verifyAdminOrModerator(db), (req, res) => {
  db.query(
    "SELECT id, username, email, role, created_at, avatar_url FROM nguoi_dung ORDER BY created_at DESC",
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi lấy danh sách người dùng!" });
      res.json(result);
    }
  );
});

// ✅ API xóa công thức (Admin)
router.delete("/delete/:id", verifyAdmin(db), (req, res) => {
  const recipeId = req.params.id;

  db.query(
    "DELETE FROM cong_thuc WHERE id = ?",
    [recipeId],
    (err) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi xóa công thức!" });
      res.json({ message: "✅ Xóa công thức thành công!" });
    }
  );
});

// ✅ API xóa người dùng (Admin)
router.delete("/user/:id", verifyAdmin(db), (req, res) => {
  const userId = req.params.id;

  db.query(
    "DELETE FROM nguoi_dung WHERE id = ?",
    [userId],
    (err) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi xóa người dùng!" });
      res.json({ message: "✅ Xóa người dùng thành công!" });
    }
  );
});

// ✅ API đổi vai trò người dùng (Admin)
router.put("/user/:id/role", verifyAdmin(db), (req, res) => {
  const userId = req.params.id;
  const { role, currentPassword } = req.body;

  // ✅ Ngăn admin tự sửa role của chính mình
  if (parseInt(userId) === req.user.id) {
    return res.status(403).json({ message: "❌ Bạn không thể thay đổi vai trò của chính mình!" });
  }

  // Validate role
  if (!role || !["user", "moderator", "admin"].includes(role)) {
    return res.status(400).json({ message: "❌ Vai trò không hợp lệ! Chỉ: user, moderator, admin" });
  }

  // ✅ Lấy role hiện tại của user
  db.query(
    "SELECT role, password_reset_at FROM nguoi_dung WHERE id = ?",
    [userId],
    (err, userRows) => {
      if (err || userRows.length === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy người dùng!" });
      }

      const currentRole = userRows[0].role;
      const passwordResetAt = userRows[0].password_reset_at;

      // ✅ Kiểm tra quyền dựa trên role hiện tại
      if (req.user.role === "moderator" && role === "admin") {
        // Moderator KHÔNG thể nâng ai lên Admin
        return res.status(403).json({ message: "❌ Quản trị viên không có quyền tạo Admin!" });
      }

      // ✅ Nếu downgrade admin → yêu cầu xác thực
      if (currentRole === "admin" && (role === "moderator" || role === "user")) {
        // Moderator KHÔNG thể downgrade Admin
        if (req.user.role === "moderator") {
          return res.status(403).json({ message: "❌ Quản trị viên không có quyền downgrade Admin!" });
        }
        // Kiểm tra nếu password vừa được reset (trong 10 phút) → cho phép downgrade
        if (passwordResetAt) {
          const resetTime = new Date(passwordResetAt).getTime();
          const now = new Date().getTime();
          const timeDiff = (now - resetTime) / (1000 * 60); // phút

          if (timeDiff < 10) {
            // Password vừa reset → cho phép downgrade ngay
            return updateRole();
          }
        }

        // Password không vừa reset → yêu cầu password của user bị downgrade
        if (!currentPassword) {
          return res.status(400).json({
            message: "⚠️ Downgrade admin cần xác thực! Nhập password của người dùng này hoặc sử dụng 'Reset Password' trước."
          });
        }

        // Verify password của user bị downgrade
        bcrypt.compare(currentPassword, userRows[0].password, (err, isValid) => {
          if (!isValid) {
            return res.status(401).json({ message: "❌ Password không đúng!" });
          }
          updateRole();
        });
      } else {
        updateRole();
      }

      // Hàm cập nhật role
      function updateRole() {
        db.query(
          "UPDATE nguoi_dung SET role = ?, password_reset_at = NULL WHERE id = ?",
          [role, userId],
          (err, result) => {
            if (err) return res.status(500).json({ message: "❌ Lỗi đổi vai trò!" });
            const roleNames = { user: "👤 User", moderator: "🔐 Quản trị viên", admin: "👑 Admin" };
            res.json({ message: `✅ Đã đổi vai trò thành ${roleNames[role]}!` });
          }
        );
      }
    }
  );
});

// ✅ API reset password người dùng (Admin)
const mailer = require('../config/mailer');
router.post("/user/:id/reset-password", verifyAdmin(db), (req, res) => {
  const userId = req.params.id;
  const tempPassword = Math.random().toString(36).substr(2, 8); // tạo password tạm 8 ký tự

  // ✅ Ngăn admin reset password của chính mình
  if (parseInt(userId) === req.user.id) {
    return res.status(403).json({ message: "❌ Bạn không thể reset password của chính mình!" });
  }

  try {
    const hashed = bcrypt.hashSync(tempPassword, 10);

    // Lấy email người dùng để gửi mật khẩu
    db.query("SELECT email, username FROM nguoi_dung WHERE id = ?", [userId], (err1, rows) => {
      if (err1) return res.status(500).json({ message: "❌ Lỗi lấy email người dùng!" });
      if (!rows || rows.length === 0) return res.status(404).json({ message: "❌ Không tìm thấy người dùng!" });

      const { email, username } = rows[0];

      db.query(
        "UPDATE nguoi_dung SET password = ?, password_reset_at = NOW() WHERE id = ?",
        [hashed, userId],
        (err, result) => {
        if (err) return res.status(500).json({ message: "❌ Lỗi reset password!" });
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "❌ Không tìm thấy người dùng!" });
          }

          // Gửi email mật khẩu mới
          const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: "CookShare - Mật khẩu tạm thời",
            html: `
              <p>Xin chào ${username || email},</p>
              <p>Mật khẩu tạm của bạn là: <b>${tempPassword}</b></p>
              <p>Vui lòng đăng nhập và đổi mật khẩu ngay để đảm bảo an toàn.</p>
              <hr />
              <p>Nếu bạn không yêu cầu thao tác này, hãy liên hệ quản trị viên.</p>
            `,
          };

          mailer.sendMail(mailOptions, (mailErr, info) => {
            if (mailErr) {
              console.error("❌ Lỗi gửi email:", mailErr);
              return res.status(500).json({ message: "✅ Reset password thành công nhưng gửi email thất bại!", tempPassword });
            }

            res.json({
              message: "✅ Reset password thành công! Mật khẩu mới đã được gửi qua email.",
            });
          });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi server: " + err.message });
  }
});

module.exports = router;
