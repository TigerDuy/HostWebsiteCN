/**
 * Migration: add reply + like support for comments
 * Run: node scripts/add_comment_features.js
 */
const db = require('../config/db');

const run = () => {
  db.query(
    `ALTER TABLE binh_luan
      ADD COLUMN parent_id INT NULL DEFAULT NULL AFTER comment;
    `,
    (err) => {
      if (err && !err.message.includes('Duplicate column name')) {
        console.error('❌ Error adding parent_id:', err.message);
      } else {
        console.log('✅ parent_id added or already exists');
      }
    }
  );

  db.query(
    `CREATE TABLE IF NOT EXISTS comment_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_comment_user (comment_id, user_id),
        CONSTRAINT fk_comment_like_comment FOREIGN KEY (comment_id) REFERENCES binh_luan(id) ON DELETE CASCADE,
        CONSTRAINT fk_comment_like_user FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    (err) => {
      if (err) {
        console.error('❌ Error creating comment_likes:', err.message);
      } else {
        console.log('✅ comment_likes created');
      }
      db.end();
    }
  );
};

run();
