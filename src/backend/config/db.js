const { Pool } = require("pg");
require("dotenv").config();

// Hỗ trợ cả DATABASE_URL (Render) và các biến riêng lẻ
const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "cookingdb",
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

const pool = new Pool(poolConfig);

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.log("❌ Kết nối PostgreSQL thất bại:", err.message);
    return;
  }
  console.log("✅ Kết nối PostgreSQL thành công!");
  
  // Verify columns exist
  client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'cong_thuc'`,
    (err, result) => {
      release();
      if (!err && result.rows.length > 0) {
        const columns = result.rows.map(r => r.column_name);
        console.log('📋 Cột trong bảng cong_thuc:', columns.join(', '));
      }
    }
  );
});

// Hàm chuyển đổi MySQL syntax sang PostgreSQL
function convertMySQLToPostgreSQL(sql) {
  let converted = sql;
  
  // Chuyển placeholder ? sang $1, $2, ...
  let paramIndex = 0;
  converted = converted.replace(/\?/g, () => `$${++paramIndex}`);
  
  // Chuyển NOW() (MySQL) - PostgreSQL cũng hỗ trợ NOW() nên không cần đổi
  
  // Chuyển DATE_SUB(NOW(), INTERVAL x DAY/MONTH/WEEK) sang PostgreSQL
  converted = converted.replace(
    /DATE_SUB\s*\(\s*NOW\s*\(\s*\)\s*,\s*INTERVAL\s+(\$?\d+|\?)\s+(DAY|MONTH|WEEK|HOUR|MINUTE)\s*\)/gi,
    (match, value, unit) => `(NOW() - INTERVAL '1 ${unit}' * ${value})`
  );
  
  // Chuyển DATE_ADD tương tự
  converted = converted.replace(
    /DATE_ADD\s*\(\s*NOW\s*\(\s*\)\s*,\s*INTERVAL\s+(\$?\d+|\?)\s+(DAY|MONTH|WEEK|HOUR|MINUTE)\s*\)/gi,
    (match, value, unit) => `(NOW() + INTERVAL '1 ${unit}' * ${value})`
  );
  
  // Chuyển IFNULL sang COALESCE
  converted = converted.replace(/IFNULL\s*\(/gi, 'COALESCE(');
  
  // Chuyển LIMIT ?, ? sang LIMIT $x OFFSET $y (đã xử lý ở trên với ?)
  
  // Chuyển ON DUPLICATE KEY UPDATE sang ON CONFLICT DO UPDATE
  // Cần xử lý case by case, tạm thời log warning
  if (converted.includes('ON DUPLICATE KEY')) {
    console.warn('⚠️ Query chứa ON DUPLICATE KEY - cần chuyển thủ công sang ON CONFLICT');
  }
  
  // Chuyển INSERT ... VALUES ? (bulk insert) - PostgreSQL dùng unnest hoặc VALUES list
  // Tạm thời giữ nguyên, xử lý riêng
  
  // Chuyển BOOLEAN: MySQL dùng TINYINT(1), PostgreSQL dùng BOOLEAN
  // Không cần chuyển trong query, chỉ cần đảm bảo schema đúng
  
  return converted;
}

// Wrapper để tương thích với code MySQL cũ (db.query callback style)
const db = {
  query: (text, params, callback) => {
    // Chuyển đổi MySQL syntax sang PostgreSQL
    const pgText = convertMySQLToPostgreSQL(text);
    
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    // Xử lý bulk insert: VALUES ? -> VALUES ($1), ($2), ...
    // MySQL: INSERT INTO table (col) VALUES ?  với params = [[val1], [val2]]
    // PostgreSQL: INSERT INTO table (col) VALUES ($1), ($2) với params = [val1, val2]
    let finalParams = params;
    let finalText = pgText;
    
    // Tự động thêm RETURNING id cho INSERT queries
    if (finalText.trim().toUpperCase().startsWith('INSERT') && !finalText.toUpperCase().includes('RETURNING')) {
      finalText = finalText.replace(/;?\s*$/, ' RETURNING id');
    }
    
    if (callback) {
      pool.query(finalText, finalParams, (err, result) => {
        if (err) {
          console.error('❌ PostgreSQL Query Error:', err.message);
          console.error('Query:', finalText);
          console.error('Params:', finalParams);
          callback(err, null);
        } else {
          // Chuyển đổi result để tương thích với mysql2
          // MySQL trả về array, PostgreSQL trả về object với rows
          const rows = result.rows;
          // Thêm các thuộc tính MySQL-style
          rows.insertId = result.rows[0]?.id || null;
          rows.affectedRows = result.rowCount;
          rows.changedRows = result.rowCount;
          callback(null, rows, result.fields);
        }
      });
    } else {
      return pool.query(finalText, finalParams).then(result => {
        const rows = result.rows;
        rows.insertId = result.rows[0]?.id || null;
        rows.affectedRows = result.rowCount;
        return rows;
      });
    }
  },
  
  // Promise-based query
  promise: () => ({
    query: async (text, params) => {
      const pgText = convertMySQLToPostgreSQL(text);
      const result = await pool.query(pgText, params);
      const rows = result.rows;
      rows.insertId = result.rows[0]?.id || null;
      rows.affectedRows = result.rowCount;
      return [rows, result.fields];
    }
  }),
  
  // Expose pool for advanced usage
  pool: pool,
  
  // Escape identifier (table/column names)
  escapeId: (identifier) => `"${identifier}"`,
  
  // End connection
  end: () => pool.end()
};

module.exports = db;
