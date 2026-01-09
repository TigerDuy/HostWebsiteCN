// Add cook_time column to cong_thuc if missing
// Usage: node scripts/add_cook_time_column.js

const db = require("../config/db");
const util = require("util");
const query = util.promisify(db.query).bind(db);

async function main() {
  try {
    const rows = await query("SHOW COLUMNS FROM cong_thuc LIKE 'cook_time'");
    if (rows.length) {
      console.log("cook_time column already exists.");
      process.exit(0);
    }
    await query("ALTER TABLE cong_thuc ADD COLUMN cook_time VARCHAR(100) NULL AFTER steps");
    console.log("Added cook_time column.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
