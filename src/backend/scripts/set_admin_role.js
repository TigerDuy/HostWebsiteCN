const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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
    console.log('Connecting to MySQL...');
    conn = await mysql.createConnection(config);

    // Tìm user "admin"
    const [rows] = await conn.execute('SELECT * FROM nguoi_dung WHERE username = ?', ['admin']);

    if (!rows || rows.length === 0) {
      console.log('❌ No user found with username "admin".');
      process.exit(0);
    }

    const user = rows[0];
    console.log('Current user state:', { id: user.id, username: user.username, email: user.email, role: user.role });

    if (user.role === 'admin') {
      console.log('⚠️  User "admin" already has role "admin". No change needed.');
      process.exit(0);
    }

    // Tạo backup
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `admin_to_admin_role_backup_${ts}.json`);

    fs.writeFileSync(
      backupPath,
      JSON.stringify({ 
        backedUpAt: new Date().toISOString(), 
        userBefore: user,
        changeFrom: user.role,
        changeTo: 'admin'
      }, null, 2)
    );

    console.log('✅ Backup written to:', backupPath);

    // Cập nhật role
    const [res] = await conn.execute('UPDATE nguoi_dung SET role = ? WHERE id = ?', ['admin', user.id]);
    console.log(`✅ Updated user "admin" (id=${user.id}): ${user.role} → admin. affectedRows=${res.affectedRows}`);

    // Xác minh
    const [verify] = await conn.execute('SELECT id, username, email, role FROM nguoi_dung WHERE id = ?', [user.id]);
    if (verify.length > 0) {
      console.log('✅ Verified new state:', { id: verify[0].id, username: verify[0].username, email: verify[0].email, role: verify[0].role });
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
