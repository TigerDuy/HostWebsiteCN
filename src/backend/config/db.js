const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

pool.connect((err, client, release) => {
  if (err) {
    console.log("❌ Kết nối PostgreSQL thất bại:", err.message);
    return;
  }
  console.log("✅ Kết nối PostgreSQL thành công!");
  release();
});

// Wrapper tương thích MySQL syntax
const db = {
  query: (text, params, callback) => {
    // Chuyển ? sang $1, $2, ...
    let idx = 0;
    const pgText = text.replace(/\?/g, () => `$${++idx}`);
    
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    if (callback) {
      pool.query(pgText, params, (err, result) => {
        if (err) {
          console.error('❌ PostgreSQL Error:', err.message);
          callback(err, null);
        } else {
          const rows = result.rows;
          rows.insertId = result.rows[0]?.id || null;
          rows.affectedRows = result.rowCount;
          callback(null, rows);
        }
      });
    } else {
      return pool.query(pgText, params).then(result => {
        const rows = result.rows;
        rows.insertId = result.rows[0]?.id || null;
        rows.affectedRows = result.rowCount;
        return rows;
      });
    }
  },
  pool
};

module.exports = db;
