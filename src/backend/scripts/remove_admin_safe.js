const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cooking_app',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  };

  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  let conn;
  try {
    console.log('Connecting to MySQL with config:', { host: config.host, user: config.user, database: config.database, port: config.port });
    conn = await mysql.createConnection(config);

    const [rows] = await conn.execute(
      "SELECT * FROM nguoi_dung WHERE username = ? AND email = ? LIMIT 1",
      ['admin', 'admin@gmail.com']
    );

    if (!rows || rows.length === 0) {
      console.log('No matching admin user found (username=admin, email=admin@gmail.com). Nothing to delete.');
      process.exit(0);
    }

    const admin = rows[0];
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `admin_backup_${ts}.json`);

    fs.writeFileSync(
      backupPath,
      JSON.stringify({ backedUpAt: new Date().toISOString(), config: { host: config.host, user: config.user, database: config.database, port: config.port }, admin }, null, 2)
    );

    console.log('Backup written to:', backupPath);

    const [res] = await conn.execute('DELETE FROM nguoi_dung WHERE id = ?', [admin.id]);
    console.log(`Deleted admin user id=${admin.id}. affectedRows=${res.affectedRows}`);

    process.exit(0);
  } catch (err) {
    console.error('Error removing admin:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
