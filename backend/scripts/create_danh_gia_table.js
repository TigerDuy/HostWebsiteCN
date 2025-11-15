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

    console.log('Creating danh_gia table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS danh_gia (
        id INT PRIMARY KEY AUTO_INCREMENT,
        recipe_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipe_id) REFERENCES cong_thuc(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
        UNIQUE KEY unique_rating (recipe_id, user_id)
      )
    `;

    await conn.execute(createTableSQL);
    console.log('✅ Table danh_gia created successfully!');

    // Create index for performance
    await conn.execute('CREATE INDEX idx_recipe_id_rating ON danh_gia(recipe_id)');
    console.log('✅ Index created successfully!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
