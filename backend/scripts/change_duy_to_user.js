const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cookingdb',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  };

  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  let conn;
  try {
    console.log('Connecting to MySQL with config:', { host: config.host, user: config.user, database: config.database, port: config.port });
    conn = await mysql.createConnection(config);

    const [rows] = await conn.execute(
      "SELECT * FROM nguoi_dung WHERE username = ? LIMIT 1",
      ['duy']
    );

    if (!rows || rows.length === 0) {
      console.log('❌ No user found with username "duy". Nothing to change.');
      process.exit(0);
    }

    const user = rows[0];
    console.log('Current user state:', { id: user.id, username: user.username, email: user.email, role: user.role });

    if (user.role === 'user') {
      console.log('⚠️  User "duy" already has role "user". No change needed.');
      process.exit(0);
    }

    // Create backup
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `duy_role_change_backup_${ts}.json`);

    fs.writeFileSync(
      backupPath,
      JSON.stringify({ 
        backedUpAt: new Date().toISOString(), 
        config: { host: config.host, user: config.user, database: config.database, port: config.port }, 
        userBefore: user,
        changeFrom: user.role,
        changeTo: 'user'
      }, null, 2)
    );

    console.log('✅ Backup written to:', backupPath);

    // Update role
    const [res] = await conn.execute('UPDATE nguoi_dung SET role = ? WHERE id = ?', ['user', user.id]);
    console.log(`✅ Updated user "duy" (id=${user.id}): ${user.role} → user. affectedRows=${res.affectedRows}`);

    // Verify change
    const [verify] = await conn.execute('SELECT id, username, email, role FROM nguoi_dung WHERE id = ?', [user.id]);
    if (verify.length > 0) {
      console.log('✅ Verified new state:', { id: verify[0].id, username: verify[0].username, email: verify[0].email, role: verify[0].role });
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error changing role:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
