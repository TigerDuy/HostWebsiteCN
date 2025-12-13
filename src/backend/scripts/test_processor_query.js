const mysql = require('mysql2');
require('dotenv').config();

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

conn.connect((err) => {
  if (err) {
    console.error('❌ Kết nối thất bại:', err);
    return;
  }
  
  console.log('✅ Kết nối thành công!');
  
  // Test query giống như backend
  conn.query(`
    SELECT 
      br.id, br.recipe_id, br.user_id, br.reason, br.status, br.rejected_reason, 
      br.created_at, br.updated_at, br.processed_by, br.processed_at,
      cr.title as recipe_title, cr.user_id as author_id,
      u_reporter.username as reporter_name, u_reporter.email as reporter_email,
      u_author.username as author_name, u_author.email as author_email,
      u_processor.username as processor_name,
      COUNT(*) OVER (PARTITION BY br.recipe_id) as total_reports_for_recipe
     FROM bao_cao br
     JOIN cong_thuc cr ON br.recipe_id = cr.id
     JOIN nguoi_dung u_reporter ON br.user_id = u_reporter.id
     JOIN nguoi_dung u_author ON cr.user_id = u_author.id
     LEFT JOIN nguoi_dung u_processor ON br.processed_by = u_processor.id
     WHERE br.status = 'accepted'
     ORDER BY br.created_at DESC
  `, (err, rows) => {
    if (err) {
      console.error('❌ Lỗi query:', err);
    } else {
      console.log('✅ Query thành công!');
      console.log('📊 Báo cáo đã xác nhận:');
      console.table(rows);
    }
    conn.end();
  });
});
