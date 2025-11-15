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

    console.log('\n⚠️  WARNING: This will DELETE all users and reset AUTO_INCREMENT!\n');

    // Xóa tất cả users
    const [res] = await conn.execute('DELETE FROM nguoi_dung');
    console.log(`✅ Deleted ${res.affectedRows} users`);

    // Reset AUTO_INCREMENT về 1
    await conn.execute('ALTER TABLE nguoi_dung AUTO_INCREMENT = 1');
    
    console.log('✅ AUTO_INCREMENT reset to 1');
    console.log('✅ All users have been deleted\n');
    console.log('Now you can start fresh with id=1, 2, 3...\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
