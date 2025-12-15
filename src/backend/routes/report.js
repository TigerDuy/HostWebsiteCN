const express = require("express");
const db = require("../config/db");
const { verifyToken, verifyAdmin, verifyAdminOrModerator } = require("../middleware/auth");
const mailer = require("../config/mailer");
const router = express.Router();

// ✅ API báo cáo bài viết
router.post("/recipe/:id", verifyToken, (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;
  const { reason } = req.body;

  if (!reason || reason.trim() === "") {
    return res.status(400).json({ message: "❌ Vui lòng nhập lý do báo cáo!" });
  }

  // Kiểm tra bài viết có tồn tại không
  db.query("SELECT id FROM cong_thuc WHERE id = ?", [recipeId], (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(404).json({ message: "❌ Bài viết không tồn tại!" });
    }

    // Kiểm tra báo cáo gần đây (pending hoặc đã xử lý trong vòng 1 ngày)
    db.query(
      `SELECT id, status, updated_at 
       FROM bao_cao 
       WHERE recipe_id = ? AND user_id = ? 
       AND (
         status = 'pending' 
         OR (status IN ('accepted', 'rejected') AND updated_at > DATE_SUB(NOW(), INTERVAL 1 DAY))
       )
       ORDER BY updated_at DESC
       LIMIT 1`,
      [recipeId, userId],
      (err, existingReports) => {
        if (err) {
          return res.status(500).json({ message: "❌ Lỗi kiểm tra báo cáo!" });
        }

        if (existingReports.length > 0) {
          const report = existingReports[0];
          if (report.status === 'pending') {
            return res.status(409).json({ message: "❌ Báo cáo của bạn đang chờ xử lý!" });
          } else {
            return res.status(409).json({ message: "❌ Bạn đã báo cáo bài viết này gần đây. Vui lòng chờ 1 ngày để báo cáo lại!" });
          }
        }

        // Tạo báo cáo mới
        const insertSql = `
          INSERT INTO bao_cao (recipe_id, user_id, reason, status)
          VALUES (?, ?, ?, 'pending')
        `;

        db.query(insertSql, [recipeId, userId, reason], (err, result) => {
          if (err) {
            if (err.code === "ER_NO_SUCH_TABLE") {
              return res.status(500).json({ message: "❌ Thiếu bảng bao_cao. Vui lòng chạy script create_bao_cao_table.js" });
            }
            if (err.code === "ER_NO_REFERENCED_ROW_2") {
              return res.status(400).json({ message: "❌ Người dùng hoặc bài viết không tồn tại (vi phạm khóa ngoại)!" });
            }
            console.error("❌ SQL error /report/recipe:", err);
            return res.status(500).json({ message: "❌ Lỗi tạo báo cáo!" });
          }

          res.json({
            message: "✅ Báo cáo bài viết thành công!",
            reportId: result.insertId,
          });
        });
      }
    );
  });
});

// ✅ API hủy báo cáo
router.delete("/recipe/:id", verifyToken, (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  db.query(
    "DELETE FROM bao_cao WHERE recipe_id = ? AND user_id = ? AND status = 'pending'",
    [recipeId, userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi hủy báo cáo!" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy báo cáo để hủy!" });
      }

      return res.json({ message: "✅ Hủy báo cáo thành công!" });
    }
  );
});

// ✅ API lấy danh sách báo cáo của user
router.get("/my-reports", verifyToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT 
      br.id, br.recipe_id, br.reason, br.status, br.rejected_reason, 
      br.created_at, br.updated_at, br.processed_by, br.processed_at,
      cr.title as recipe_title,
      u_processor.username as processor_name, u_processor.id as processor_id
     FROM bao_cao br
     JOIN cong_thuc cr ON br.recipe_id = cr.id
     LEFT JOIN nguoi_dung u_processor ON br.processed_by = u_processor.id
     WHERE br.user_id = ?
     ORDER BY br.created_at DESC`,
    [userId],
    (err, reports) => {
      if (err) {
        return res.status(500).json({ message: "❌ Lỗi lấy danh sách báo cáo!" });
      }

      res.json(reports);
    }
  );
});

// ✅ API Admin/Moderator xem danh sách báo cáo
router.get("/", verifyAdminOrModerator(db), (req, res) => {
  const statusFilter = req.query.status || "pending"; // pending, accepted, rejected

  db.query(
    `SELECT 
      br.id, br.recipe_id, br.user_id, br.reason, br.status, br.rejected_reason, 
      br.created_at, br.updated_at, br.processed_by, br.processed_at,
      cr.title as recipe_title, cr.user_id as author_id,
      u_reporter.username as reporter_name, u_reporter.email as reporter_email, u_reporter.id as reporter_id,
      u_author.username as author_name, u_author.email as author_email, u_author.id as author_id,
      u_processor.username as processor_name, u_processor.id as processor_id,
      COUNT(*) OVER (PARTITION BY br.recipe_id) as total_reports_for_recipe
     FROM bao_cao br
     JOIN cong_thuc cr ON br.recipe_id = cr.id
     JOIN nguoi_dung u_reporter ON br.user_id = u_reporter.id
     JOIN nguoi_dung u_author ON cr.user_id = u_author.id
     LEFT JOIN nguoi_dung u_processor ON br.processed_by = u_processor.id
     WHERE br.status = ?
     ORDER BY br.created_at DESC`,
    [statusFilter],
    (err, reports) => {
      if (err) {
        console.error("❌ Lỗi lấy danh sách báo cáo:", err);
        return res.status(500).json({ message: "❌ Lỗi lấy danh sách báo cáo!" });
      }

      res.json(reports);
    }
  );
});

// ✅ API Admin/Moderator xác nhận/bác bỏ báo cáo
router.put("/:id/status", verifyAdminOrModerator(db), (req, res) => {
  const reportId = req.params.id;
  const { status, rejectedReason } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "❌ Trạng thái không hợp lệ!" });
  }

  // Lấy thông tin báo cáo
  db.query(
    `SELECT br.*, cr.user_id, cr.title, u.email, u.username 
     FROM bao_cao br
     JOIN cong_thuc cr ON br.recipe_id = cr.id
     JOIN nguoi_dung u ON br.user_id = u.id
     WHERE br.id = ?`,
    [reportId],
    (err, reports) => {
      if (err || reports.length === 0) {
        return res.status(404).json({ message: "❌ Không tìm thấy báo cáo!" });
      }

      const report = reports[0];
      const processorId = req.user.id; // ID của người xử lý (admin/moderator)
      let updateQuery, updateParams;

      if (status === "accepted") {
        updateQuery = "UPDATE bao_cao SET status = 'accepted', processed_by = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?";
        updateParams = [processorId, reportId];
      } else {
        updateQuery = "UPDATE bao_cao SET status = 'rejected', rejected_reason = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?";
        updateParams = [rejectedReason || "", processorId, reportId];
      }

      db.query(updateQuery, updateParams, (err, result) => {
        if (err) {
          return res.status(500).json({ message: "❌ Lỗi cập nhật báo cáo!" });
        }

        // Nếu xác nhận vi phạm: tăng violation_count và ẩn bài viết nếu đạt 3
        if (status === "accepted") {
          db.query(
            "UPDATE cong_thuc SET violation_count = violation_count + 1, is_hidden = IF(violation_count + 1 >= 3, TRUE, is_hidden) WHERE id = ?",
            [report.recipe_id],
            (errViolation) => {
              if (errViolation) console.error("❌ Lỗi cập nhật violation_count:", errViolation);
              else console.log("✅ Đã tăng violation_count cho bài viết", report.recipe_id);
            }
          );
        }

        // Gửi email tương ứng
        if (status === "accepted") {
          // Email cảnh báo cho tác giả bài viết
          const authorMailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: report.user_id === report.user_id ? report.email : report.email, // Lấy email tác giả từ db.query
            subject: "CookShare - Cảnh báo: Bài viết của bạn vi phạm quy định",
            html: `
              <p>Xin chào <b>${report.username}</b>,</p>
              <p>Bài viết "<b>${report.title}</b>" của bạn đã được báo cáo và kiểm duyệt viên xác nhận rằng nó <b>vi phạm quy định</b> của CookShare.</p>
              <p><b>Lý do vi phạm:</b> ${report.reason}</p>
              <p>Vui lòng xem xét lại và mình sẽ xóa bài viết nếu vi phạm không được khắc phục trong vòng 7 ngày.</p>
              <hr />
              <p>Nếu bạn có bất kỳ thắc mắc, vui lòng liên hệ admin.</p>
            `,
          };

          mailer.sendMail(authorMailOptions, (err) => {
            if (err) console.error("❌ Lỗi gửi email cảnh báo cho tác giả:", err);
            else console.log("✅ Email cảnh báo gửi cho tác giả thành công");
          });

          // Email cảm ơn người báo cáo
          const reporterMailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: report.reporter_email,
            subject: "CookShare - Cảm ơn bạn đã báo cáo",
            html: `
              <p>Xin chào <b>${report.reporter_name}</b>,</p>
              <p>Cảm ơn bạn đã giúp chúng tôi bằng cách báo cáo bài viết "<b>${report.title}</b>" vi phạm quy định.</p>
              <p>Chúng tôi đã xác nhận báo cáo của bạn và sẽ xử lý bài viết này.</p>
              <p>Đóng góp của bạn giúp chúng tôi duy trì một cộng đồng an toàn và tuyệt vời.</p>
              <hr />
              <p>Cảm ơn đã sử dụng CookShare!</p>
            `,
          };

          mailer.sendMail(reporterMailOptions, (err) => {
            if (err) console.error("❌ Lỗi gửi email cảm ơn:", err);
            else console.log("✅ Email cảm ơn gửi cho người báo cáo thành công");
          });
        } else {
          // Email bác bỏ báo cáo cho người báo cáo
          const rejectMailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: report.reporter_email,
            subject: "CookShare - Báo cáo của bạn đã được bác bỏ",
            html: `
              <p>Xin chào <b>${report.reporter_name}</b>,</p>
              <p>Báo cáo của bạn về bài viết "<b>${report.title}</b>" đã được kiểm duyệt viên xem xét.</p>
              <p><b>Kết quả:</b> Bác bỏ báo cáo</p>
              <p><b>Lý do:</b> ${rejectedReason || "Bài viết không vi phạm quy định"}</p>
              <p>Bạn có thể tiếp tục báo cáo nếu phát hiện bài viết khác vi phạm.</p>
              <hr />
              <p>Cảm ơn sự giúp đỡ của bạn!</p>
            `,
          };

          mailer.sendMail(rejectMailOptions, (err) => {
            if (err) console.error("❌ Lỗi gửi email bác bỏ:", err);
            else console.log("✅ Email bác bỏ báo cáo gửi thành công");
          });
        }

        res.json({
          message: `✅ ${status === "accepted" ? "Xác nhận" : "Bác bỏ"} báo cáo thành công!`,
          reportId: reportId,
          reportStatus: status,
        });
      });
    }
  );
});

module.exports = router;
