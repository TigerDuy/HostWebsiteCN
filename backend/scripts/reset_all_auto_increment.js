const mysql = require('mysql2/promise');

(async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cookingdb',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  };

  const tables = ['nguoi_dung', 'cong_thuc', 'binh_luan', 'favorite', 'danh_gia'];

  let conn;
  try {
    console.log('Connecting to MySQL...');
    conn = await mysql.createConnection(config);

    console.log('\n🔄 Resetting AUTO_INCREMENT for all tables...\n');

    for (const table of tables) {
      try {
        // Lấy id lớn nhất
        const [maxIdResult] = await conn.execute(`SELECT MAX(id) as max_id FROM ${table}`);
        const maxId = maxIdResult[0].max_id || 0;
        const newAutoIncrement = maxId + 1;

        console.log(`📊 Table: ${table}`);
        console.log(`   Max id: ${maxId}`);
        console.log(`   Setting AUTO_INCREMENT to: ${newAutoIncrement}`);

        // Reset AUTO_INCREMENT
        await conn.execute(`ALTER TABLE ${table} AUTO_INCREMENT = ${newAutoIncrement}`);
        
        // Xác minh
        const [tableStatus] = await conn.execute(`SHOW TABLE STATUS WHERE name = "${table}"`);
        if (tableStatus.length > 0) {
          console.log(`   ✅ Verified: AUTO_INCREMENT is now ${tableStatus[0].Auto_increment}\n`);
        }
      } catch (err) {
        console.error(`   ❌ Error for table ${table}: ${err.message}\n`);
      }
    }

    console.log('✅ AUTO_INCREMENT reset completed for all tables!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Error:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
