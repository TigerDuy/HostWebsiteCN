const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY || process.env.JWT_SECRET || "SECRET_KEY";

// ✅ Middleware xác thực token với check role từ DB
const verifyToken = (req, res, next) => {
  const header = req.headers["authorization"];
  
  if (!header) {
    return res.status(401).json({ message: "❌ Không có token! Vui lòng đăng nhập." });
  }

  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "❌ Token không hợp lệ!" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "❌ Token hết hạn hoặc không hợp lệ!" });
    }

    // ✅ Check role từ DB để phát hiện thay đổi
    const db = require("../config/db");
    db.query(
      "SELECT role FROM nguoi_dung WHERE id = ?",
      [decoded.id],
      (err, rows) => {
        if (err || rows.length === 0) {
          return res.status(403).json({ message: "❌ Người dùng không tồn tại!" });
        }

        // Nếu role trong DB khác với role trong token, yêu cầu đăng nhập lại
        if (decoded.role && rows[0].role !== decoded.role) {
          return res.status(403).json({ 
            message: "ROLE_CHANGED", 
            needRelogin: true 
          });
        }

        req.user = { ...decoded, role: rows[0].role };
        next();
      }
    );
  });
};

// ✅ Middleware kiểm tra admin
const verifyAdmin = (db) => {
  return (req, res, next) => {
    const header = req.headers["authorization"];
    
    if (!header) {
      return res.status(401).json({ message: "❌ Không có token!" });
    }

    const token = header.split(" ")[1];

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "❌ Token không hợp lệ!" });
      }

      db.query(
        "SELECT role FROM nguoi_dung WHERE id = ?",
        [user.id],
        (err, rows) => {
          if (err || rows.length === 0) {
            return res.status(403).json({ message: "❌ Người dùng không tồn tại!" });
          }

          if (rows[0].role !== "admin") {
            return res.status(403).json({ message: "❌ Bạn không có quyền admin!" });
          }

          req.user = user;
          next();
        }
      );
    });
  };
};

// ✅ Middleware kiểm tra admin hoặc moderator
const verifyAdminOrModerator = (db) => {
  return (req, res, next) => {
    const header = req.headers["authorization"];
    
    if (!header) {
      return res.status(401).json({ message: "❌ Không có token!" });
    }

    const token = header.split(" ")[1];

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "❌ Token không hợp lệ!" });
      }

      db.query(
        "SELECT role FROM nguoi_dung WHERE id = ?",
        [user.id],
        (err, rows) => {
          if (err || rows.length === 0) {
            return res.status(403).json({ message: "❌ Người dùng không tồn tại!" });
          }

          if (!["admin", "moderator"].includes(rows[0].role)) {
            return res.status(403).json({ message: "❌ Bạn không có quyền!" });
          }

          req.user = { ...user, role: rows[0].role };
          next();
        }
      );
    });
  };
};

module.exports = { verifyToken, verifyAdmin, verifyAdminOrModerator };
