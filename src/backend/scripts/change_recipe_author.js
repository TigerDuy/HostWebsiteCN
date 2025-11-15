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

    // Tìm công thức "Mì xào"
    const [recipes] = await conn.execute(
      'SELECT cong_thuc.*, nguoi_dung.username FROM cong_thuc JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id WHERE cong_thuc.title LIKE ?',
      ['%mì xào%']
    );

    if (!recipes || recipes.length === 0) {
      console.log('❌ Recipe "Mì xào" not found');
      process.exit(0);
    }

    const recipe = recipes[0];
    console.log('Found recipe:', { id: recipe.id, title: recipe.title, currentAuthor: recipe.username });

    // Tìm user "Thanh Duy" hoặc "Duy"
    const [users] = await conn.execute(
      'SELECT id, username FROM nguoi_dung WHERE username LIKE ?',
      ['%Duy%']
    );

    if (!users || users.length === 0) {
      console.log('❌ User containing "Duy" not found');
      process.exit(0);
    }

    const newAuthor = users[0];
    console.log('Target user:', { id: newAuthor.id, username: newAuthor.username });

    // Tạo backup
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `recipe_author_change_${ts}.json`);

    fs.writeFileSync(
      backupPath,
      JSON.stringify({
        backedUpAt: new Date().toISOString(),
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        oldAuthor: { id: recipe.user_id, username: recipe.username },
        newAuthor: { id: newAuthor.id, username: newAuthor.username }
      }, null, 2)
    );

    console.log('✅ Backup written to:', backupPath);

    // Cập nhật tác giả
    const [res] = await conn.execute(
      'UPDATE cong_thuc SET user_id = ? WHERE id = ?',
      [newAuthor.id, recipe.id]
    );

    console.log(`✅ Updated recipe "${recipe.title}" author: ${recipe.username} → ${newAuthor.username}. affectedRows=${res.affectedRows}`);

    // Xác minh
    const [verify] = await conn.execute(
      'SELECT cong_thuc.*, nguoi_dung.username FROM cong_thuc JOIN nguoi_dung ON cong_thuc.user_id = nguoi_dung.id WHERE cong_thuc.id = ?',
      [recipe.id]
    );

    if (verify.length > 0) {
      console.log('✅ Verified new state:', { id: verify[0].id, title: verify[0].title, author: verify[0].username });
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
