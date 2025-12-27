-- ✅ MIGRATION: Thêm bảng comment_violation_history

CREATE TABLE IF NOT EXISTS comment_violation_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  comment_id INT NOT NULL,
  user_id INT NOT NULL,
  report_id INT NOT NULL,
  violated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  FOREIGN KEY (report_id) REFERENCES bao_cao(id) ON DELETE CASCADE
);

CREATE INDEX idx_comment_violation_user ON comment_violation_history(user_id);
CREATE INDEX idx_comment_violation_date ON comment_violation_history(violated_at);
