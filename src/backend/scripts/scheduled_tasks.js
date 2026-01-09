/**
 * Scheduled Tasks - Các tác vụ tự động
 * - Xóa bài viết ẩn quá 30 ngày
 * - Reset khóa tính năng khi hết hạn
 * - Reset monthly violations
 */

const db = require("../config/db");

const CONFIG = {
  HIDDEN_POST_DELETE_DAYS: 30,
};

// Xóa bài viết ẩn quá 30 ngày
function deleteOldHiddenPosts() {
  console.log("🔄 Kiểm tra bài viết ẩn cần xóa...");
  
  db.pool.query(
    `SELECT id, title, user_id FROM cong_thuc 
     WHERE is_hidden = TRUE AND hidden_at < NOW() - INTERVAL '${CONFIG.HIDDEN_POST_DELETE_DAYS} days'`,
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi kiểm tra bài viết ẩn:", err);
        return;
      }

      const posts = result.rows;
      if (posts.length === 0) {
        console.log("✅ Không có bài viết nào cần xóa");
        return;
      }

      console.log(`📋 Tìm thấy ${posts.length} bài viết cần xóa`);

      posts.forEach((post) => {
        db.pool.query("DELETE FROM cong_thuc WHERE id = $1", [post.id], (err2) => {
          if (err2) {
            console.error(`❌ Lỗi xóa bài viết ${post.id}:`, err2);
          } else {
            console.log(`✅ Đã xóa bài viết: "${post.title}" (ID: ${post.id})`);
          }
        });
      });
    }
  );
}

// Reset khóa tính năng khi hết hạn
function resetExpiredBlocks() {
  console.log("🔄 Kiểm tra khóa tính năng hết hạn...");

  // Reset posting block
  db.pool.query(
    `UPDATE nguoi_dung SET is_posting_blocked = FALSE, posting_blocked_until = NULL 
     WHERE is_posting_blocked = TRUE AND posting_blocked_until < NOW()`,
    (err, result) => {
      if (err) console.error("❌ Lỗi reset posting block:", err);
      else if (result.rowCount > 0) 
        console.log(`✅ Đã mở khóa đăng bài cho ${result.rowCount} người dùng`);
    }
  );

  // Reset commenting block
  db.pool.query(
    `UPDATE nguoi_dung SET is_commenting_blocked = FALSE, commenting_blocked_until = NULL 
     WHERE is_commenting_blocked = TRUE AND commenting_blocked_until < NOW()`,
    (err, result) => {
      if (err) console.error("❌ Lỗi reset commenting block:", err);
      else if (result.rowCount > 0) 
        console.log(`✅ Đã mở khóa bình luận cho ${result.rowCount} người dùng`);
    }
  );

  // Reset reporting block
  db.pool.query(
    `UPDATE nguoi_dung SET is_reporting_blocked = FALSE, reporting_blocked_until = NULL 
     WHERE is_reporting_blocked = TRUE AND reporting_blocked_until < NOW()`,
    (err, result) => {
      if (err) console.error("❌ Lỗi reset reporting block:", err);
      else if (result.rowCount > 0) 
        console.log(`✅ Đã mở khóa báo cáo cho ${result.rowCount} người dùng`);
    }
  );
}

// Reset monthly violations (chạy đầu mỗi tháng)
function resetMonthlyViolations() {
  console.log("🔄 Reset monthly violations...");

  db.pool.query(
    `UPDATE nguoi_dung SET 
      monthly_post_violations = 0, 
      monthly_comment_violations = 0, 
      monthly_rejected_reports = 0,
      last_violation_reset = NOW()
     WHERE last_violation_reset < NOW() - INTERVAL '1 month'`,
    (err, result) => {
      if (err) console.error("❌ Lỗi reset monthly violations:", err);
      else if (result.rowCount > 0) 
        console.log(`✅ Đã reset violations cho ${result.rowCount} người dùng`);
    }
  );
}

// Chạy tất cả tasks
function runAllTasks() {
  console.log("\n========== SCHEDULED TASKS ==========");
  console.log(`⏰ ${new Date().toLocaleString("vi-VN")}`);
  
  deleteOldHiddenPosts();
  resetExpiredBlocks();
  resetMonthlyViolations();
  
  console.log("======================================\n");
}

// Export để có thể gọi từ server.js hoặc chạy độc lập
module.exports = {
  deleteOldHiddenPosts,
  resetExpiredBlocks,
  resetMonthlyViolations,
  runAllTasks,
};

// Nếu chạy trực tiếp
if (require.main === module) {
  runAllTasks();
  setTimeout(() => process.exit(0), 5000);
}
