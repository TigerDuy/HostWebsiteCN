/**
 * Script import database vào PostgreSQL trên Render
 * Chạy: node import_to_render.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://cookingdb_1mh5_user:QFIxBBDUwyzqGw5gkaIFwesWQqu7WyFP@dpg-d5fpaq95pdvs73ffi9t0-a.singapore-postgres.render.com/cookingdb_1mh5';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importDatabase() {
  console.log('🔌 Kết nối đến PostgreSQL trên Render...');
  
  const client = await pool.connect();
  
  try {
    console.log('✅ Kết nối thành công!');
    
    // Đọc file SQL từ thư mục database
    const sqlFile = path.join(__dirname, '..', 'database', 'cookingdb_postgres_full.sql');
    console.log('📖 Đọc file SQL...');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Tách thành các statements riêng lẻ
    const statements = [];
    let currentStatement = '';
    
    const lines = sql.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Bỏ qua comment và dòng trống
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Kiểm tra kết thúc statement
      if (trimmedLine.endsWith(';')) {
        if (currentStatement.trim()) {
          statements.push(currentStatement.trim());
        }
        currentStatement = '';
      }
    }
    
    // Thêm statement cuối nếu có
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`📊 Tìm thấy ${statements.length} statements`);
    
    // Thực thi từng statement
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
        success++;
        
        // Log progress
        if ((i + 1) % 10 === 0 || i === statements.length - 1) {
          console.log(`⏳ Đã thực thi ${i + 1}/${statements.length} statements...`);
        }
      } catch (err) {
        failed++;
        // Chỉ log lỗi quan trọng
        if (!err.message.includes('already exists') && 
            !err.message.includes('duplicate key')) {
          console.error(`❌ Lỗi statement ${i + 1}:`, err.message);
          console.error('Statement:', stmt.substring(0, 100) + '...');
        }
      }
    }
    
    console.log('\n📊 Kết quả:');
    console.log(`✅ Thành công: ${success}`);
    console.log(`❌ Thất bại: ${failed}`);
    
    // Kiểm tra các bảng đã tạo
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Các bảng đã tạo:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Kiểm tra số lượng records
    console.log('\n📊 Số lượng records:');
    const tables = ['nguoi_dung', 'cong_thuc', 'binh_luan', 'danh_gia', 'favorite'];
    for (const table of tables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  - ${table}: ${countResult.rows[0].count} records`);
      } catch (e) {
        console.log(`  - ${table}: (không tồn tại)`);
      }
    }
    
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    client.release();
    await pool.end();
    console.log('\n🔌 Đã đóng kết nối.');
  }
}

importDatabase();
