const mysql = require('mysql2/promise');

(async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cookingdb',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  };

  let conn;
  try {
    console.log('Connecting to MySQL...');
    conn = await mysql.createConnection(config);

    // Lấy id lớn nhất
    const [maxIdResult] = await conn.execute('SELECT MAX(id) as max_id FROM nguoi_dung');
    const maxId = maxIdResult[0].max_id || 0;
    const newAutoIncrement = maxId + 1;

    console.log(`📊 Current max id: ${maxId}`);
    console.log(`📊 Will set AUTO_INCREMENT to: ${newAutoIncrement}`);

    // Reset AUTO_INCREMENT
    await conn.execute(`ALTER TABLE nguoi_dung AUTO_INCREMENT = ${newAutoIncrement}`);
    
    console.log(`✅ AUTO_INCREMENT reset thành công!`);

    // Xác minh
    const [tableStatus] = await conn.execute('SHOW TABLE STATUS WHERE name = "nguoi_dung"');
    if (tableStatus.length > 0) {
      console.log(`✅ Verified: AUTO_INCREMENT is now ${tableStatus[0].Auto_increment}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
