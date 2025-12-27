const express = require("express");
const db = require("../config/db");
const { verifyToken, verifyAdminOrModerator } = require("../middleware/auth");
const mailer = require("../config/mailer");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Cấu hình multer cho upload ảnh báo cáo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/reports"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "report-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)"));
    }
  },
});

// Cấu hình thời gian (có thể điều chỉnh)
const CONFIG = {
  VIOLATION_WINDOW_DAYS: 7, // Khoảng thời gian tính vi phạm (7 ngày)
  VIOLATIONS_TO_HIDE: 3, // Số vi phạm để ẩn bài viết
  POSTS_VIOLATIONS_TO_BLOCK: 3, // Số bài bị khóa để khóa tính năng đăng bài
  REJECTED_REPORTS_TO_BLOCK: 3, // Số báo cáo bị bác bỏ để khóa tính năng báo cáo
  COMMENT_VIOLATIONS_TO_BLOCK: 3, // Số vi phạm bình luận để khóa tính năng bình luận
  BLOCK_DURATION_DAYS: 30, // Thời gian khóa (30 ngày)
  HIDDEN_POST_DELETE_DAYS: 30, // Số ngày ẩn trước khi xóa tự động
  REPORT_QUOTA_PER_TYPE: 3, // Số lần báo cáo mỗi loại
};

// ============ HELPER FUNCTIONS ============

// Kiểm tra user có bị khóa báo cáo không
const checkReportingBlocked = (userId, callback) => {
  db.query(
    `SELECT is_reporting_blocked, reporting_blocked_until FROM nguoi_dung WHERE id = ?`,
    [userId],
    (err, rows) => {
      if (err || rows.length === 0) return callback(err, true);
      const user = rows[0];
      if (user.is_reporting_blocked) {
        if (user.reporting_blocked_until && new Date(user.reporting_blocked_until) < new Date()) {
          // Hết hạn khóa, mở khóa
          db.query(
            `UPDATE nguoi_dung SET is_reporting_blocked = FALSE, reporting_blocked_until = NULL WHERE id = ?`,
            [userId]
          );
          return callback(null, false);
        }
        return callback(null, true, user.reporting_blocked_until);
      }
      callback(null, false);
    }
  );
};

// Kiểm tra và lấy quota báo cáo
const getReportQuota = (userId, reportType, callback) => {
  db.query(
    `SELECT * FROM user_report_quota WHERE user_id = ? AND report_type = ?`,
    [userId, reportType],
    (err, rows) => {
      if (err) return callback(err);
      if (rows.length === 0) {
        // Tạo quota mới
        db.query(
          `INSERT INTO user_report_quota (user_id, report_type, remaining_reports) VALUES (?, ?, ?)`,
          [userId, reportType, CONFIG.REPORT_QUOTA_PER_TYPE],
          (err2) => {
            if (err2) return callback(err2);
            callback(null, { remaining_reports: CONFIG.REPORT_QUOTA_PER_TYPE });
          }
        );
      } else {
        callback(null, rows[0]);
      }
    }
  );
};

// Giảm quota báo cáo
const decreaseReportQuota = (userId, reportType, callback) => {
  db.query(
    `UPDATE user_report_quota SET remaining_reports = remaining_reports - 1 
     WHERE user_id = ? AND report_type = ? AND remaining_reports > 0`,
    [userId, reportType],
    callback
  );
};

// Hoàn lại quota khi báo cáo được xử lý
const restoreReportQuota = (userId, reportType, callback) => {
  db.query(
    `UPDATE user_report_quota SET remaining_reports = LEAST(remaining_reports + 1, ?) 
     WHERE user_id = ? AND report_type = ?`,
    [CONFIG.REPORT_QUOTA_PER_TYPE, userId, reportType],
    callback
  );
};

// Kiểm tra số vi phạm trong khoảng thời gian
const countViolationsInWindow = (recipeId, callback) => {
  db.query(
    `SELECT COUNT(*) as count FROM recipe_violation_history 
     WHERE recipe_id = ? AND violated_at > DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [recipeId, CONFIG.VIOLATION_WINDOW_DAYS],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0].count);
    }
  );
};

// Đếm số bài viết bị khóa trong tháng của user
const countHiddenPostsThisMonth = (userId, callback) => {
  db.query(
    `SELECT COUNT(*) as count FROM cong_thuc 
     WHERE user_id = ? AND is_hidden = TRUE 
     AND hidden_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)`,
    [userId],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0].count);
    }
  );
};

// Đếm số báo cáo bị bác bỏ trong tuần
const countRejectedReportsThisWeek = (userId, callback) => {
  db.query(
    `SELECT COUNT(*) as count FROM bao_cao 
     WHERE user_id = ? AND status = 'rejected' 
     AND updated_at > DATE_SUB(NOW(), INTERVAL 1 WEEK)`,
    [userId],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0].count);
    }
  );
};

// Đếm số vi phạm bình luận trong tháng
const countCommentViolationsThisMonth = (userId, callback) => {
  db.query(
    `SELECT COUNT(*) as count FROM comment_violation_history 
     WHERE user_id = ? AND violated_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)`,
    [userId],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0].count);
    }
  );
};

// ============ API BÁO CÁO BÀI VIẾT ============
router.post("/recipe/:id", verifyToken, upload.single("image"), (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;
  const { reason } = req.body;
  const imageUrl = req.file ? `/uploads/reports/${req.file.filename}` : null;

  if (!reason || reason.trim() === "") {
    return res.status(400).json({ message: "❌ Vui lòng nhập lý do báo cáo!" });
  }

  // Kiểm tra user có bị khóa báo cáo không
  checkReportingBlocked(userId, (err, isBlocked, blockedUntil) => {
    if (err) return res.status(500).json({ message: "❌ Lỗi kiểm tra quyền báo cáo!" });
    if (isBlocked) {
      const until = blockedUntil ? new Date(blockedUntil).toLocaleDateString("vi-VN") : "";
      return res.status(403).json({ 
        message: `❌ Bạn đã bị khóa tính năng báo cáo đến ${until}!` 
      });
    }

    // Kiểm tra quota
    getReportQuota(userId, "recipe", (err, quota) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi kiểm tra quota!" });
      if (quota.remaining_reports <= 0) {
        return res.status(403).json({ 
          message: "❌ Bạn đã hết lượt báo cáo bài viết! Vui lòng chờ báo cáo trước đó được xử lý." 
        });
      }

      // Kiểm tra bài viết tồn tại
      db.query("SELECT id FROM cong_thuc WHERE id = ?", [recipeId], (err, rows) => {
        if (err || rows.length === 0) {
          return res.status(404).json({ message: "❌ Bài viết không tồn tại!" });
        }

        // Kiểm tra báo cáo pending
        db.query(
          `SELECT id FROM bao_cao WHERE recipe_id = ? AND user_id = ? AND status = 'pending' AND target_type = 'recipe'`,
          [recipeId, userId],
          (err, existing) => {
            if (err) return res.status(500).json({ message: "❌ Lỗi kiểm tra báo cáo!" });
            if (existing.length > 0) {
              return res.status(409).json({ message: "❌ Báo cáo của bạn đang chờ xử lý!" });
            }

            // Tạo báo cáo mới
            db.query(
              `INSERT INTO bao_cao (recipe_id, user_id, reason, image_url, status, target_type)
               VALUES (?, ?, ?, ?, 'pending', 'recipe')`,
              [recipeId, userId, reason, imageUrl],
              (err, result) => {
                if (err) {
                  console.error("❌ SQL error /report/recipe:", err);
                  return res.status(500).json({ message: "❌ Lỗi tạo báo cáo!" });
                }

                // Giảm quota
                decreaseReportQuota(userId, "recipe", () => {});

                res.json({
                  message: "✅ Báo cáo bài viết thành công!",
                  reportId: result.insertId,
                });
              }
            );
          }
        );
      });
    });
  });
});


// ============ API BÁO CÁO BÌNH LUẬN ============
router.post("/comment/:id", verifyToken, upload.single("image"), (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;
  const { reason } = req.body;
  const imageUrl = req.file ? `/uploads/reports/${req.file.filename}` : null;

  if (!reason || reason.trim() === "") {
    return res.status(400).json({ message: "❌ Vui lòng nhập lý do báo cáo!" });
  }

  checkReportingBlocked(userId, (err, isBlocked, blockedUntil) => {
    if (err) return res.status(500).json({ message: "❌ Lỗi kiểm tra quyền báo cáo!" });
    if (isBlocked) {
      const until = blockedUntil ? new Date(blockedUntil).toLocaleDateString("vi-VN") : "";
      return res.status(403).json({ message: `❌ Bạn đã bị khóa tính năng báo cáo đến ${until}!` });
    }

    getReportQuota(userId, "comment", (err, quota) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi kiểm tra quota!" });
      if (quota.remaining_reports <= 0) {
        return res.status(403).json({ message: "❌ Bạn đã hết lượt báo cáo bình luận!" });
      }

      // Kiểm tra bình luận tồn tại
      db.query("SELECT id, user_id, recipe_id FROM binh_luan WHERE id = ?", [commentId], (err, rows) => {
        if (err || rows.length === 0) {
          return res.status(404).json({ message: "❌ Bình luận không tồn tại!" });
        }

        const comment = rows[0];

        // Kiểm tra báo cáo pending
        db.query(
          `SELECT id FROM bao_cao WHERE comment_id = ? AND user_id = ? AND status = 'pending' AND target_type = 'comment'`,
          [commentId, userId],
          (err, existing) => {
            if (err) return res.status(500).json({ message: "❌ Lỗi kiểm tra báo cáo!" });
            if (existing.length > 0) {
              return res.status(409).json({ message: "❌ Báo cáo của bạn đang chờ xử lý!" });
            }

            db.query(
              `INSERT INTO bao_cao (comment_id, user_id, reason, image_url, status, target_type, recipe_id)
               VALUES (?, ?, ?, ?, 'pending', 'comment', ?)`,
              [commentId, userId, reason, imageUrl, comment.recipe_id],
              (err, result) => {
                if (err) {
                  console.error("❌ SQL error /report/comment:", err);
                  return res.status(500).json({ message: "❌ Lỗi tạo báo cáo!" });
                }

                decreaseReportQuota(userId, "comment", () => {});

                res.json({
                  message: "✅ Báo cáo bình luận thành công!",
                  reportId: result.insertId,
                });
              }
            );
          }
        );
      });
    });
  });
});

// ============ API BÁO CÁO NGƯỜI DÙNG ============
router.post("/user/:id", verifyToken, upload.single("image"), (req, res) => {
  const reportedUserId = req.params.id;
  const userId = req.user.id;
  const { reason } = req.body;
  const imageUrl = req.file ? `/uploads/reports/${req.file.filename}` : null;

  if (!reason || reason.trim() === "") {
    return res.status(400).json({ message: "❌ Vui lòng nhập lý do báo cáo!" });
  }

  if (parseInt(reportedUserId) === userId) {
    return res.status(400).json({ message: "❌ Bạn không thể báo cáo chính mình!" });
  }

  checkReportingBlocked(userId, (err, isBlocked, blockedUntil) => {
    if (err) return res.status(500).json({ message: "❌ Lỗi kiểm tra quyền báo cáo!" });
    if (isBlocked) {
      const until = blockedUntil ? new Date(blockedUntil).toLocaleDateString("vi-VN") : "";
      return res.status(403).json({ message: `❌ Bạn đã bị khóa tính năng báo cáo đến ${until}!` });
    }

    getReportQuota(userId, "user", (err, quota) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi kiểm tra quota!" });
      if (quota.remaining_reports <= 0) {
        return res.status(403).json({ message: "❌ Bạn đã hết lượt báo cáo người dùng!" });
      }

      // Kiểm tra người dùng tồn tại
      db.query("SELECT id, role FROM nguoi_dung WHERE id = ?", [reportedUserId], (err, rows) => {
        if (err || rows.length === 0) {
          return res.status(404).json({ message: "❌ Người dùng không tồn tại!" });
        }

        if (rows[0].role === "admin" || rows[0].role === "moderator") {
          return res.status(403).json({ message: "❌ Không thể báo cáo quản trị viên!" });
        }

        // Kiểm tra báo cáo pending
        db.query(
          `SELECT id FROM bao_cao WHERE reported_user_id = ? AND user_id = ? AND status = 'pending' AND target_type = 'user'`,
          [reportedUserId, userId],
          (err, existing) => {
            if (err) return res.status(500).json({ message: "❌ Lỗi kiểm tra báo cáo!" });
            if (existing.length > 0) {
              return res.status(409).json({ message: "❌ Báo cáo của bạn đang chờ xử lý!" });
            }

            db.query(
              `INSERT INTO bao_cao (reported_user_id, user_id, reason, image_url, status, target_type)
               VALUES (?, ?, ?, ?, 'pending', 'user')`,
              [reportedUserId, userId, reason, imageUrl],
              (err, result) => {
                if (err) {
                  console.error("❌ SQL error /report/user:", err);
                  return res.status(500).json({ message: "❌ Lỗi tạo báo cáo!" });
                }

                decreaseReportQuota(userId, "user", () => {});

                res.json({
                  message: "✅ Báo cáo người dùng thành công!",
                  reportId: result.insertId,
                });
              }
            );
          }
        );
      });
    });
  });
});

// ============ API HỦY BÁO CÁO ============
router.delete("/recipe/:id", verifyToken, (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  db.query(
    "DELETE FROM bao_cao WHERE recipe_id = ? AND user_id = ? AND status = 'pending' AND target_type = 'recipe'",
    [recipeId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi hủy báo cáo!" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy báo cáo để hủy!" });
      }

      // Hoàn lại quota
      restoreReportQuota(userId, "recipe", () => {});

      return res.json({ message: "✅ Hủy báo cáo thành công!" });
    }
  );
});

router.delete("/comment/:id", verifyToken, (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  db.query(
    "DELETE FROM bao_cao WHERE comment_id = ? AND user_id = ? AND status = 'pending' AND target_type = 'comment'",
    [commentId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi hủy báo cáo!" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy báo cáo để hủy!" });
      }

      restoreReportQuota(userId, "comment", () => {});
      return res.json({ message: "✅ Hủy báo cáo thành công!" });
    }
  );
});

// ============ API LẤY QUOTA BÁO CÁO ============
router.get("/quota", verifyToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT report_type, remaining_reports FROM user_report_quota WHERE user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi lấy quota!" });

      const quota = {
        recipe: CONFIG.REPORT_QUOTA_PER_TYPE,
        comment: CONFIG.REPORT_QUOTA_PER_TYPE,
        user: CONFIG.REPORT_QUOTA_PER_TYPE,
      };

      rows.forEach((row) => {
        quota[row.report_type] = row.remaining_reports;
      });

      res.json(quota);
    }
  );
});

// ============ API LẤY DANH SÁCH BÁO CÁO CỦA USER ============
router.get("/my-reports", verifyToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT 
      br.id, br.recipe_id, br.comment_id, br.reported_user_id, br.reason, 
      br.image_url, br.status, br.rejected_reason, br.target_type,
      br.created_at, br.updated_at, br.processed_by, br.processed_at,
      cr.title as recipe_title,
      bl.comment as comment_content,
      ru.username as reported_username,
      u_processor.username as processor_name
     FROM bao_cao br
     LEFT JOIN cong_thuc cr ON br.recipe_id = cr.id
     LEFT JOIN binh_luan bl ON br.comment_id = bl.id
     LEFT JOIN nguoi_dung ru ON br.reported_user_id = ru.id
     LEFT JOIN nguoi_dung u_processor ON br.processed_by = u_processor.id
     WHERE br.user_id = ?
     ORDER BY br.created_at DESC`,
    [userId],
    (err, reports) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi lấy danh sách báo cáo!" });
      res.json(reports);
    }
  );
});


// ============ API ADMIN/MODERATOR XEM DANH SÁCH BÁO CÁO ============
router.get("/", verifyAdminOrModerator(db), (req, res) => {
  const statusFilter = req.query.status || "pending";
  const typeFilter = req.query.type || "all"; // all, recipe, comment, user

  let whereClause = "WHERE br.status = ?";
  let params = [statusFilter];

  if (typeFilter !== "all") {
    whereClause += " AND br.target_type = ?";
    params.push(typeFilter);
  }

  db.query(
    `SELECT 
      br.id, br.recipe_id, br.comment_id, br.reported_user_id, br.user_id, 
      br.reason, br.image_url, br.status, br.rejected_reason, br.target_type,
      br.created_at, br.updated_at, br.processed_by, br.processed_at,
      cr.title as recipe_title, cr.user_id as author_id,
      bl.comment as comment_content, bl.user_id as comment_author_id,
      u_reporter.username as reporter_name, u_reporter.email as reporter_email, u_reporter.id as reporter_id,
      u_author.username as author_name, u_author.email as author_email,
      u_comment_author.username as comment_author_name, u_comment_author.email as comment_author_email,
      u_reported.username as reported_username, u_reported.email as reported_email,
      u_processor.username as processor_name, u_processor.id as processor_id,
      COUNT(*) OVER (PARTITION BY br.recipe_id, br.target_type) as total_reports_for_target
     FROM bao_cao br
     LEFT JOIN cong_thuc cr ON br.recipe_id = cr.id
     LEFT JOIN binh_luan bl ON br.comment_id = bl.id
     JOIN nguoi_dung u_reporter ON br.user_id = u_reporter.id
     LEFT JOIN nguoi_dung u_author ON cr.user_id = u_author.id
     LEFT JOIN nguoi_dung u_comment_author ON bl.user_id = u_comment_author.id
     LEFT JOIN nguoi_dung u_reported ON br.reported_user_id = u_reported.id
     LEFT JOIN nguoi_dung u_processor ON br.processed_by = u_processor.id
     ${whereClause}
     ORDER BY br.created_at DESC`,
    params,
    (err, reports) => {
      if (err) {
        console.error("❌ Lỗi lấy danh sách báo cáo:", err);
        return res.status(500).json({ message: "❌ Lỗi lấy danh sách báo cáo!" });
      }
      res.json(reports);
    }
  );
});

// ============ API XỬ LÝ BÁO CÁO ============
router.put("/:id/status", verifyAdminOrModerator(db), (req, res) => {
  const reportId = req.params.id;
  const { status, rejectedReason } = req.body;
  const processorId = req.user.id;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "❌ Trạng thái không hợp lệ!" });
  }

  // Lấy thông tin báo cáo
  db.query(
    `SELECT br.*, 
      cr.user_id as recipe_author_id, cr.title as recipe_title,
      bl.user_id as comment_author_id, bl.comment as comment_content,
      u_reporter.email as reporter_email, u_reporter.username as reporter_name,
      u_recipe_author.email as recipe_author_email, u_recipe_author.username as recipe_author_name,
      u_comment_author.email as comment_author_email, u_comment_author.username as comment_author_name,
      u_reported.email as reported_email, u_reported.username as reported_name
     FROM bao_cao br
     LEFT JOIN cong_thuc cr ON br.recipe_id = cr.id
     LEFT JOIN binh_luan bl ON br.comment_id = bl.id
     LEFT JOIN nguoi_dung u_reporter ON br.user_id = u_reporter.id
     LEFT JOIN nguoi_dung u_recipe_author ON cr.user_id = u_recipe_author.id
     LEFT JOIN nguoi_dung u_comment_author ON bl.user_id = u_comment_author.id
     LEFT JOIN nguoi_dung u_reported ON br.reported_user_id = u_reported.id
     WHERE br.id = ?`,
    [reportId],
    (err, reports) => {
      if (err || reports.length === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy báo cáo!" });
      }

      const report = reports[0];
      let updateQuery, updateParams;

      if (status === "accepted") {
        updateQuery = "UPDATE bao_cao SET status = 'accepted', processed_by = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?";
        updateParams = [processorId, reportId];
      } else {
        updateQuery = "UPDATE bao_cao SET status = 'rejected', rejected_reason = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?";
        updateParams = [rejectedReason || "", processorId, reportId];
      }

      db.query(updateQuery, updateParams, (err) => {
        if (err) return res.status(500).json({ message: "❌ Lỗi cập nhật báo cáo!" });

        // Hoàn lại quota cho người báo cáo
        restoreReportQuota(report.user_id, report.target_type, () => {});

        if (status === "accepted") {
          handleAcceptedReport(report, processorId, res);
        } else {
          handleRejectedReport(report, rejectedReason, res);
        }
      });
    }
  );
});

// Xử lý khi báo cáo được chấp nhận
function handleAcceptedReport(report, processorId, res) {
  if (report.target_type === "recipe") {
    // Thêm vào lịch sử vi phạm
    db.query(
      `INSERT INTO recipe_violation_history (recipe_id, report_id) VALUES (?, ?)`,
      [report.recipe_id, report.id]
    );

    // Kiểm tra số vi phạm trong khoảng thời gian
    countViolationsInWindow(report.recipe_id, (err, count) => {
      if (count >= CONFIG.VIOLATIONS_TO_HIDE) {
        // Ẩn bài viết
        db.query(
          `UPDATE cong_thuc SET is_hidden = TRUE, hidden_at = NOW(), violation_count = ? WHERE id = ?`,
          [count, report.recipe_id]
        );

        // Kiểm tra số bài bị khóa của user trong tháng
        countHiddenPostsThisMonth(report.recipe_author_id, (err, hiddenCount) => {
          if (hiddenCount >= CONFIG.POSTS_VIOLATIONS_TO_BLOCK) {
            // Khóa tính năng đăng bài
            const blockUntil = new Date();
            blockUntil.setDate(blockUntil.getDate() + CONFIG.BLOCK_DURATION_DAYS);
            db.query(
              `UPDATE nguoi_dung SET is_posting_blocked = TRUE, posting_blocked_until = ? WHERE id = ?`,
              [blockUntil, report.recipe_author_id]
            );
          }
        });

        // Gửi email thông báo bài viết bị ẩn
        sendViolationEmail(report, "recipe_hidden");
      } else {
        // Cập nhật violation_count
        db.query(
          `UPDATE cong_thuc SET violation_count = ? WHERE id = ?`,
          [count, report.recipe_id]
        );
        sendViolationEmail(report, "recipe_warning");
      }
    });
  } else if (report.target_type === "comment") {
    // Kiểm tra comment_author_id có tồn tại không
    if (!report.comment_author_id) {
      console.error("❌ Không tìm thấy tác giả bình luận, có thể bình luận đã bị xóa");
      // Vẫn gửi response thành công vì báo cáo đã được xử lý
      return res.json({
        message: "✅ Xác nhận báo cáo thành công! (Bình luận có thể đã bị xóa trước đó)",
        reportId: report.id,
        reportStatus: "accepted",
      });
    }

    // Thêm vào lịch sử vi phạm bình luận
    db.query(
      `INSERT INTO comment_violation_history (comment_id, user_id, report_id) VALUES (?, ?, ?)`,
      [report.comment_id, report.comment_author_id, report.id],
      (err) => {
        if (err) {
          console.error("❌ Lỗi thêm lịch sử vi phạm bình luận:", err);
        }
      }
    );

    // Xóa bình luận vi phạm
    db.query(`DELETE FROM binh_luan WHERE id = ?`, [report.comment_id]);

    // Kiểm tra số vi phạm bình luận của user
    countCommentViolationsThisMonth(report.comment_author_id, (err, count) => {
      if (err) {
        console.error("❌ Lỗi đếm vi phạm bình luận:", err);
        count = 0;
      }
      if (count >= CONFIG.COMMENT_VIOLATIONS_TO_BLOCK) {
        const blockUntil = new Date();
        blockUntil.setDate(blockUntil.getDate() + CONFIG.BLOCK_DURATION_DAYS);
        db.query(
          `UPDATE nguoi_dung SET is_commenting_blocked = TRUE, commenting_blocked_until = ? WHERE id = ?`,
          [blockUntil, report.comment_author_id]
        );
        sendViolationEmail(report, "comment_blocked");
      } else {
        sendViolationEmail(report, "comment_deleted");
      }
    });
  } else if (report.target_type === "user") {
    // Kiểm tra reported user có tồn tại không
    if (!report.reported_email) {
      console.error("❌ Không tìm thấy thông tin người dùng bị báo cáo");
    } else {
      sendViolationEmail(report, "user_warning");
    }
  }

  // Gửi email cảm ơn người báo cáo
  sendThankYouEmail(report);

  res.json({
    message: "✅ Xác nhận báo cáo thành công!",
    reportId: report.id,
    reportStatus: "accepted",
  });
}

// Xử lý khi báo cáo bị bác bỏ
function handleRejectedReport(report, rejectedReason, res) {
  // Đếm số báo cáo bị bác bỏ trong tuần
  countRejectedReportsThisWeek(report.user_id, (err, count) => {
    if (count >= CONFIG.REJECTED_REPORTS_TO_BLOCK) {
      const blockUntil = new Date();
      blockUntil.setDate(blockUntil.getDate() + CONFIG.BLOCK_DURATION_DAYS);
      db.query(
        `UPDATE nguoi_dung SET is_reporting_blocked = TRUE, reporting_blocked_until = ? WHERE id = ?`,
        [blockUntil, report.user_id]
      );
    }
  });

  // Gửi email thông báo bác bỏ
  sendRejectionEmail(report, rejectedReason);

  res.json({
    message: "✅ Bác bỏ báo cáo thành công!",
    reportId: report.id,
    reportStatus: "rejected",
  });
}

// ============ EMAIL FUNCTIONS ============
function sendViolationEmail(report, type) {
  let to, subject, html;
  const imageHtml = report.image_url 
    ? `<p><b>Bằng chứng:</b></p><img src="${process.env.BASE_URL || 'http://localhost:3001'}${report.image_url}" style="max-width: 400px; border: 1px solid #ddd;" />`
    : "";

  switch (type) {
    case "recipe_hidden":
      to = report.recipe_author_email;
      subject = "CookShare - Bài viết của bạn đã bị ẩn";
      html = `
        <p>Xin chào <b>${report.recipe_author_name}</b>,</p>
        <p>Bài viết "<b>${report.recipe_title}</b>" của bạn đã bị ẩn do vi phạm quy định nhiều lần.</p>
        <p><b>Lý do:</b> ${report.reason}</p>
        ${imageHtml}
        <p>Bài viết sẽ bị xóa vĩnh viễn sau 30 ngày nếu không được khắc phục.</p>
        <hr /><p>Liên hệ admin nếu bạn có thắc mắc.</p>
      `;
      break;
    case "recipe_warning":
      to = report.recipe_author_email;
      subject = "CookShare - Cảnh báo vi phạm bài viết";
      html = `
        <p>Xin chào <b>${report.recipe_author_name}</b>,</p>
        <p>Bài viết "<b>${report.recipe_title}</b>" của bạn đã bị báo cáo và xác nhận vi phạm.</p>
        <p><b>Lý do:</b> ${report.reason}</p>
        ${imageHtml}
        <p>Vui lòng chỉnh sửa bài viết để tránh bị ẩn.</p>
      `;
      break;
    case "comment_deleted":
      to = report.comment_author_email;
      subject = "CookShare - Bình luận của bạn đã bị xóa";
      html = `
        <p>Xin chào <b>${report.comment_author_name}</b>,</p>
        <p>Bình luận của bạn đã bị xóa do vi phạm quy định.</p>
        <p><b>Nội dung:</b> "${report.comment_content}"</p>
        <p><b>Lý do:</b> ${report.reason}</p>
        ${imageHtml}
      `;
      break;
    case "comment_blocked":
      to = report.comment_author_email;
      subject = "CookShare - Bạn đã bị khóa tính năng bình luận";
      html = `
        <p>Xin chào <b>${report.comment_author_name}</b>,</p>
        <p>Do vi phạm quy định bình luận nhiều lần, bạn đã bị khóa tính năng bình luận trong 30 ngày.</p>
        <p><b>Lý do gần nhất:</b> ${report.reason}</p>
        ${imageHtml}
      `;
      break;
    case "user_warning":
      to = report.reported_email;
      subject = "CookShare - Cảnh báo về tài khoản";
      html = `
        <p>Xin chào <b>${report.reported_name}</b>,</p>
        <p>Tài khoản của bạn đã bị báo cáo và xác nhận vi phạm quy định.</p>
        <p><b>Lý do:</b> ${report.reason}</p>
        ${imageHtml}
        <p>Vui lòng tuân thủ quy định cộng đồng.</p>
      `;
      break;
  }

  if (to && mailer) {
    mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    }, (err) => {
      if (err) console.error("❌ Lỗi gửi email:", err);
    });
  }
}

function sendThankYouEmail(report) {
  if (!report.reporter_email || !mailer) return;
  
  mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: report.reporter_email,
    subject: "CookShare - Cảm ơn bạn đã báo cáo",
    html: `
      <p>Xin chào <b>${report.reporter_name}</b>,</p>
      <p>Cảm ơn bạn đã giúp chúng tôi duy trì cộng đồng an toàn.</p>
      <p>Báo cáo của bạn đã được xác nhận và xử lý.</p>
    `,
  }, (err) => {
    if (err) console.error("❌ Lỗi gửi email cảm ơn:", err);
  });
}

function sendRejectionEmail(report, rejectedReason) {
  if (!report.reporter_email || !mailer) return;

  mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: report.reporter_email,
    subject: "CookShare - Báo cáo của bạn đã được xem xét",
    html: `
      <p>Xin chào <b>${report.reporter_name}</b>,</p>
      <p>Báo cáo của bạn đã được xem xét và bác bỏ.</p>
      <p><b>Lý do:</b> ${rejectedReason || "Không vi phạm quy định"}</p>
      <p>Bạn có thể tiếp tục báo cáo nếu phát hiện vi phạm khác.</p>
    `,
  }, (err) => {
    if (err) console.error("❌ Lỗi gửi email bác bỏ:", err);
  });
}

module.exports = router;
