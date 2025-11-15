const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const dbName = process.env.DB_NAME || 'cooking_app';

  try {
    const conn = await mysql.createConnection({ host, user, password, port });

    console.log('Connected to MySQL server at', host + ':' + port);

    // List databases
    const [dbs] = await conn.query('SHOW DATABASES');
    console.log('\nDatabases:');
    dbs.forEach(d => console.log(' -', d.Database));

    // Check target database exists
    const dbExists = dbs.some(d => d.Database === dbName);
    if (!dbExists) {
      console.error(`\n❌ Database '${dbName}' does not exist.`);
      await conn.end();
      process.exit(1);
    }

    // List tables in target database
    await conn.changeUser({ database: dbName });
    const [tables] = await conn.query("SHOW TABLES");
    console.log(`\nTables in '${dbName}':`);
    const tableKey = Object.keys(tables[0] || {})[0] || 'Tables_in_' + dbName;
    for (const t of tables) {
      const tableName = t[tableKey];
      // count rows
      try {
        const [[countRow]] = await conn.query(`SELECT COUNT(*) as c FROM \`${tableName}\``);
        console.log(` - ${tableName}: ${countRow.c} rows`);
      } catch (e) {
        console.log(` - ${tableName}: (count failed)`, e.message);
      }
    }

    await conn.end();
    console.log('\nCheck complete.');
  } catch (err) {
    console.error('Error checking DB status:', err.message || err);
    process.exit(1);
  }
})();
