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
  limits: { fileSize: 5 * 1024 * 1024 },
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

// Cấu hình thời gian
const CONFIG = {
  VIOLATION_WINDOW_DAYS: 7,
  VIOLATIONS_TO_HIDE: 3,
  POSTS_VIOLATIONS_TO_BLOCK: 3,
  REJECTED_REPORTS_TO_BLOCK: 3,
  COMMENT_VIOLATIONS_TO_BLOCK: 3,
  BLOCK_DURATION_DAYS: 30,
  HIDDEN_POST_DELETE_DAYS: 30,
  REPORT_QUOTA_PER_TYPE: 3,
};

// ============ HELPER FUNCTIONS ============

// Kiểm tra user có bị khóa báo cáo không
const checkReportingBlocked = async (userId) => {
  const rows = await db.query(
    `SELECT is_reporting_blocked, reporting_blocked_until FROM nguoi_dung WHERE id = $1`,
    [userId]
  );
  if (rows.length === 0) return { isBlocked: true };
  
  const user = rows[0];
  if (user.is_reporting_blocked) {
    if (user.reporting_blocked_until && new Date(user.reporting_blocked_until) < new Date()) {
      await db.query(
        `UPDATE nguoi_dung SET is_reporting_blocked = FALSE, reporting_blocked_until = NULL WHERE id = $1`,
        [userId]
      );
      return { isBlocked: false };
    }
    return { isBlocked: true, blockedUntil: user.reporting_blocked_until };
  }
  return { isBlocked: false };
};

// Kiểm tra và lấy quota báo cáo
const getReportQuota = async (userId, reportType) => {
  const rows = await db.query(
    `SELECT * FROM user_report_quota WHERE user_id = $1 AND report_type = $2`,
    [userId, reportType]
  );
  
  if (rows.length === 0) {
    await db.query(
      `INSERT INTO user_report_quota (user_id, report_type, remaining_reports) VALUES ($1, $2, $3)`,
      [userId, reportType, CONFIG.REPORT_QUOTA_PER_TYPE]
    );
    return { remaining_reports: CONFIG.REPORT_QUOTA_PER_TYPE };
  }
  return rows[0];
};

// Giảm quota báo cáo
const decreaseReportQuota = async (userId, reportType) => {
  await db.query(
    `UPDATE user_report_quota SET remaining_reports = remaining_reports - 1 
     WHERE user_id = $1 AND report_type = $2 AND remaining_reports > 0`,
    [userId, reportType]
  );
};

// Hoàn lại quota khi báo cáo được xử lý
const restoreReportQuota = async (userId, reportType) => {
  await db.query(
    `UPDATE user_report_quota SET remaining_reports = LEAST(remaining_reports + 1, $1) 
     WHERE user_id = $2 AND report_type = $3`,
    [CONFIG.REPORT_QUOTA_PER_TYPE, userId, reportType]
  );
};

// Kiểm tra số vi phạm trong khoảng thời gian
const countViolationsInWindow = async (recipeId) => {
  const rows = await db.query(
    `SELECT COUNT(*) as count FROM recipe_violation_history 
     WHERE recipe_id = $1 AND violated_at > NOW() - INTERVAL '${CONFIG.VIOLATION_WINDOW_DAYS} days'`,
    [recipeId]
  );
  return parseInt(rows[0]?.count) || 0;
};

// Đếm số bài viết bị khóa trong tháng của user
const countHiddenPostsThisMonth = async (userId) => {
  const rows = await db.query(
    `SELECT COUNT(*) as count FROM cong_thuc 
     WHERE user_id = $1 AND is_hidden = TRUE 
     AND hidden_at > NOW() - INTERVAL '1 month'`,
    [userId]
  );
  return parseInt(rows[0]?.count) || 0;
};

// Đếm số báo cáo bị bác bỏ trong tuần
const countRejectedReportsThisWeek = async (userId) => {
  const rows = await db.query(
    `SELECT COUNT(*) as count FROM bao_cao 
     WHERE user_id = $1 AND status = 'rejected' 
     AND updated_at > NOW() - INTERVAL '1 week'`,
    [userId]
  );
  return parseInt(rows[0]?.count) || 0;
};

// Đếm số vi phạm bình luận trong tháng
const countCommentViolationsThisMonth = async (userId) => {
  const rows = await db.query(
    `SELECT COUNT(*) as count FROM comment_violation_history 
     WHERE user_id = $1 AND violated_at > NOW() - INTERVAL '1 month'`,
    [userId]
  );
  return parseInt(rows[0]?.count) || 0;
};

// ============ API BÁO CÁO BÀI VIẾT ============
router.post("/recipe/:id", verifyToken, upload.single("image"), async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;
  const { reason } = req.body;
  const imageUrl = req.file ? `/uploads/reports/${req.file.filename}` : null;

  if (!reason || reason.trim() === "") {
    return res.status(400).json({ message: "❌ Vui lòng nhập lý do báo cáo!" });
  }

  try {
    const { isBlocked, blockedUntil } = await checkReportingBlocked(userId);
    if (isBlocked) {
      const until = blockedUntil ? new Date(blockedUntil).toLocaleDateString("vi-VN") : "";
      return res.status(403).json({ message: `❌ Bạn đã bị khóa tính năng báo cáo đến ${until}!` });
    }

    const quota = await getReportQuota(userId, "recipe");
    if (quota.remaining_reports <= 0) {
      return res.status(403).json({ message: "❌ Bạn đã hết lượt báo cáo bài viết! Vui lòng chờ báo cáo trước đó được xử lý." });
    }

    const recipeRows = await db.query("SELECT id FROM cong_thuc WHERE id = $1", [recipeId]);
    if (recipeRows.length === 0) {
      return res.status(404).json({ message: "❌ Bài viết không tồn tại!" });
    }

    const existing = await db.query(
      `SELECT id FROM bao_cao WHERE recipe_id = $1 AND user_id = $2 AND status = 'pending' AND target_type = 'recipe'`,
      [recipeId, userId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "❌ Báo cáo của bạn đang chờ xử lý!" });
    }

    const result = await db.query(
      `INSERT INTO bao_cao (recipe_id, user_id, reason, image_url, status, target_type)
       VALUES ($1, $2, $3, $4, 'pending', 'recipe') RETURNING id`,
      [recipeId, userId, reason, imageUrl]
    );

    await decreaseReportQuota(userId, "recipe");

    res.json({ message: "✅ Báo cáo bài viết thành công!", reportId: result[0]?.id });
  } catch (err) {
    console.error("❌ SQL error /report/recipe:", err);
    res.status(500).json({ message: "❌ Lỗi tạo báo cáo!" });
  }
});

// ============ API BÁO CÁO BÌNH LUẬN ============
router.post("/comment/:id", verifyToken, upload.single("image"), async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;
  const { reason } = req.body;
  const imageUrl = req.file ? `/uploads/reports/${req.file.filename}` : null;

  if (!reason || reason.trim() === "") {
    return res.status(400).json({ message: "❌ Vui lòng nhập lý do báo cáo!" });
  }

  try {
    const { isBlocked, blockedUntil } = await checkReportingBlocked(userId);
    if (isBlocked) {
      const until = blockedUntil ? new Date(blockedUntil).toLocaleDateString("vi-VN") : "";
      return res.status(403).json({ message: `❌ Bạn đã bị khóa tính năng báo cáo đến ${until}!` });
    }

    const quota = await getReportQuota(userId, "comment");
    if (quota.remaining_reports <= 0) {
      return res.status(403).json({ message: "❌ Bạn đã hết lượt báo cáo bình luận!" });
    }

    const commentRows = await db.query("SELECT id, user_id, recipe_id FROM binh_luan WHERE id = $1", [commentId]);
    if (commentRows.length === 0) {
      return res.status(404).json({ message: "❌ Bình luận không tồn tại!" });
    }

    const comment = commentRows[0];

    const existing = await db.query(
      `SELECT id FROM bao_cao WHERE comment_id = $1 AND user_id = $2 AND status = 'pending' AND target_type = 'comment'`,
      [commentId, userId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "❌ Báo cáo của bạn đang chờ xử lý!" });
    }

    const result = await db.query(
      `INSERT INTO bao_cao (comment_id, user_id, reason, image_url, status, target_type, recipe_id)
       VALUES ($1, $2, $3, $4, 'pending', 'comment', $5) RETURNING id`,
      [commentId, userId, reason, imageUrl, comment.recipe_id]
    );

    await decreaseReportQuota(userId, "comment");

    res.json({ message: "✅ Báo cáo bình luận thành công!", reportId: result[0]?.id });
  } catch (err) {
    console.error("❌ SQL error /report/comment:", err);
    res.status(500).json({ message: "❌ Lỗi tạo báo cáo!" });
  }
});

// ============ API BÁO CÁO NGƯỜI DÙNG ============
router.post("/user/:id", verifyToken, upload.single("image"), async (req, res) => {
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

  try {
    const { isBlocked, blockedUntil } = await checkReportingBlocked(userId);
    if (isBlocked) {
      const until = blockedUntil ? new Date(blockedUntil).toLocaleDateString("vi-VN") : "";
      return res.status(403).json({ message: `❌ Bạn đã bị khóa tính năng báo cáo đến ${until}!` });
    }

    const quota = await getReportQuota(userId, "user");
    if (quota.remaining_reports <= 0) {
      return res.status(403).json({ message: "❌ Bạn đã hết lượt báo cáo người dùng!" });
    }

    const userRows = await db.query("SELECT id, role FROM nguoi_dung WHERE id = $1", [reportedUserId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "❌ Người dùng không tồn tại!" });
    }

    if (userRows[0].role === "admin" || userRows[0].role === "moderator") {
      return res.status(403).json({ message: "❌ Không thể báo cáo quản trị viên!" });
    }

    const existing = await db.query(
      `SELECT id FROM bao_cao WHERE reported_user_id = $1 AND user_id = $2 AND status = 'pending' AND target_type = 'user'`,
      [reportedUserId, userId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "❌ Báo cáo của bạn đang chờ xử lý!" });
    }

    const result = await db.query(
      `INSERT INTO bao_cao (reported_user_id, user_id, reason, image_url, status, target_type)
       VALUES ($1, $2, $3, $4, 'pending', 'user') RETURNING id`,
      [reportedUserId, userId, reason, imageUrl]
    );

    await decreaseReportQuota(userId, "user");

    res.json({ message: "✅ Báo cáo người dùng thành công!", reportId: result[0]?.id });
  } catch (err) {
    console.error("❌ SQL error /report/user:", err);
    res.status(500).json({ message: "❌ Lỗi tạo báo cáo!" });
  }
});

// ============ API HỦY BÁO CÁO ============
router.delete("/recipe/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "DELETE FROM bao_cao WHERE recipe_id = $1 AND user_id = $2 AND status = 'pending' AND target_type = 'recipe'",
      [recipeId, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Không tìm thấy báo cáo để hủy!" });
    }
    await restoreReportQuota(userId, "recipe");
    return res.json({ message: "✅ Hủy báo cáo thành công!" });
  } catch (err) {
    console.error("❌ Lỗi hủy báo cáo:", err);
    res.status(500).json({ message: "❌ Lỗi hủy báo cáo!" });
  }
});

router.delete("/comment/:id", verifyToken, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "DELETE FROM bao_cao WHERE comment_id = $1 AND user_id = $2 AND status = 'pending' AND target_type = 'comment'",
      [commentId, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Không tìm thấy báo cáo để hủy!" });
    }
    await restoreReportQuota(userId, "comment");
    return res.json({ message: "✅ Hủy báo cáo thành công!" });
  } catch (err) {
    console.error("❌ Lỗi hủy báo cáo:", err);
    res.status(500).json({ message: "❌ Lỗi hủy báo cáo!" });
  }
});

router.delete("/user/:id", verifyToken, async (req, res) => {
  const reportedUserId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "DELETE FROM bao_cao WHERE reported_user_id = $1 AND user_id = $2 AND status = 'pending' AND target_type = 'user'",
      [reportedUserId, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Không tìm thấy báo cáo để hủy!" });
    }
    await restoreReportQuota(userId, "user");
    return res.json({ message: "✅ Hủy báo cáo thành công!" });
  } catch (err) {
    console.error("❌ Lỗi hủy báo cáo:", err);
    res.status(500).json({ message: "❌ Lỗi hủy báo cáo!" });
  }
});

// ============ API LẤY QUOTA BÁO CÁO ============
router.get("/quota", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const rows = await db.query(
      `SELECT report_type, remaining_reports FROM user_report_quota WHERE user_id = $1`,
      [userId]
    );

    const quota = {
      recipe: CONFIG.REPORT_QUOTA_PER_TYPE,
      comment: CONFIG.REPORT_QUOTA_PER_TYPE,
      user: CONFIG.REPORT_QUOTA_PER_TYPE,
    };

    rows.forEach((row) => {
      quota[row.report_type] = row.remaining_reports;
    });

    res.json(quota);
  } catch (err) {
    console.error("❌ Lỗi lấy quota:", err);
    res.status(500).json({ message: "❌ Lỗi lấy quota!" });
  }
});

// ============ API LẤY DANH SÁCH BÁO CÁO CỦA USER ============
router.get("/my-reports", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const reports = await db.query(
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
       WHERE br.user_id = $1
       ORDER BY br.created_at DESC`,
      [userId]
    );
    res.json(reports);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách báo cáo:", err);
    res.status(500).json({ message: "❌ Lỗi lấy danh sách báo cáo!" });
  }
});

// ============ API ADMIN/MODERATOR XEM DANH SÁCH BÁO CÁO ============
router.get("/", verifyAdminOrModerator(db), async (req, res) => {
  const statusFilter = req.query.status || "pending";
  const typeFilter = req.query.type || "all";

  let whereClause = "WHERE br.status = $1";
  let params = [statusFilter];

  if (typeFilter !== "all") {
    whereClause += " AND br.target_type = $2";
    params.push(typeFilter);
  }

  try {
    const reports = await db.query(
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
      params
    );
    res.json(reports);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách báo cáo:", err);
    res.status(500).json({ message: "❌ Lỗi lấy danh sách báo cáo!" });
  }
});

// ============ API XỬ LÝ BÁO CÁO ============
router.put("/:id/status", verifyAdminOrModerator(db), async (req, res) => {
  const reportId = req.params.id;
  const { status, rejectedReason } = req.body;
  const processorId = req.user.id;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "❌ Trạng thái không hợp lệ!" });
  }

  try {
    const reports = await db.query(
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
       WHERE br.id = $1`,
      [reportId]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: "❌ Không tìm thấy báo cáo!" });
    }

    const report = reports[0];

    if (status === "accepted") {
      await db.query(
        "UPDATE bao_cao SET status = 'accepted', processed_by = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2",
        [processorId, reportId]
      );
    } else {
      await db.query(
        "UPDATE bao_cao SET status = 'rejected', rejected_reason = $1, processed_by = $2, processed_at = CURRENT_TIMESTAMP WHERE id = $3",
        [rejectedReason || "", processorId, reportId]
      );
    }

    await restoreReportQuota(report.user_id, report.target_type);

    if (status === "accepted") {
      await handleAcceptedReport(report, processorId, res);
    } else {
      await handleRejectedReport(report, rejectedReason, res);
    }
  } catch (err) {
    console.error("❌ Lỗi xử lý báo cáo:", err);
    res.status(500).json({ message: "❌ Lỗi xử lý báo cáo!" });
  }
});

// Xử lý khi báo cáo được chấp nhận
async function handleAcceptedReport(report, processorId, res) {
  try {
    if (report.target_type === "recipe") {
      await db.query(
        `INSERT INTO recipe_violation_history (recipe_id, report_id) VALUES ($1, $2)`,
        [report.recipe_id, report.id]
      );

      const count = await countViolationsInWindow(report.recipe_id);

      if (count >= CONFIG.VIOLATIONS_TO_HIDE) {
        await db.query(
          `UPDATE cong_thuc SET is_hidden = TRUE, hidden_at = NOW(), violation_count = $1 WHERE id = $2`,
          [count, report.recipe_id]
        );

        const hiddenCount = await countHiddenPostsThisMonth(report.recipe_author_id);
        if (hiddenCount >= CONFIG.POSTS_VIOLATIONS_TO_BLOCK) {
          const blockUntil = new Date();
          blockUntil.setDate(blockUntil.getDate() + CONFIG.BLOCK_DURATION_DAYS);
          await db.query(
            `UPDATE nguoi_dung SET is_posting_blocked = TRUE, posting_blocked_until = $1 WHERE id = $2`,
            [blockUntil, report.recipe_author_id]
          );
        }

        sendViolationEmail(report, "recipe_hidden");
      } else {
        await db.query(
          `UPDATE cong_thuc SET violation_count = $1 WHERE id = $2`,
          [count, report.recipe_id]
        );
        sendViolationEmail(report, "recipe_warning");
      }
    } else if (report.target_type === "comment") {
      if (!report.comment_author_id) {
        return res.json({
          message: "✅ Xác nhận báo cáo thành công! (Bình luận có thể đã bị xóa trước đó)",
          reportId: report.id,
          reportStatus: "accepted",
        });
      }

      await db.query(
        `INSERT INTO comment_violation_history (comment_id, user_id, report_id) VALUES ($1, $2, $3)`,
        [report.comment_id, report.comment_author_id, report.id]
      );

      await db.query(`DELETE FROM binh_luan WHERE id = $1`, [report.comment_id]);

      const count = await countCommentViolationsThisMonth(report.comment_author_id);
      if (count >= CONFIG.COMMENT_VIOLATIONS_TO_BLOCK) {
        const blockUntil = new Date();
        blockUntil.setDate(blockUntil.getDate() + CONFIG.BLOCK_DURATION_DAYS);
        await db.query(
          `UPDATE nguoi_dung SET is_commenting_blocked = TRUE, commenting_blocked_until = $1 WHERE id = $2`,
          [blockUntil, report.comment_author_id]
        );
        sendViolationEmail(report, "comment_blocked");
      } else {
        sendViolationEmail(report, "comment_deleted");
      }
    } else if (report.target_type === "user") {
      if (report.reported_email) {
        sendViolationEmail(report, "user_warning");
      }
    }

    sendThankYouEmail(report);

    res.json({
      message: "✅ Xác nhận báo cáo thành công!",
      reportId: report.id,
      reportStatus: "accepted",
    });
  } catch (err) {
    console.error("❌ Lỗi xử lý báo cáo accepted:", err);
    res.status(500).json({ message: "❌ Lỗi xử lý báo cáo!" });
  }
}

// Xử lý khi báo cáo bị bác bỏ
async function handleRejectedReport(report, rejectedReason, res) {
  try {
    const count = await countRejectedReportsThisWeek(report.user_id);
    if (count >= CONFIG.REJECTED_REPORTS_TO_BLOCK) {
      const blockUntil = new Date();
      blockUntil.setDate(blockUntil.getDate() + CONFIG.BLOCK_DURATION_DAYS);
      await db.query(
        `UPDATE nguoi_dung SET is_reporting_blocked = TRUE, reporting_blocked_until = $1 WHERE id = $2`,
        [blockUntil, report.user_id]
      );
    }

    sendRejectionEmail(report, rejectedReason);

    res.json({
      message: "✅ Bác bỏ báo cáo thành công!",
      reportId: report.id,
      reportStatus: "rejected",
    });
  } catch (err) {
    console.error("❌ Lỗi xử lý báo cáo rejected:", err);
    res.status(500).json({ message: "❌ Lỗi xử lý báo cáo!" });
  }
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
