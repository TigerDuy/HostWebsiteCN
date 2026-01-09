const db = require('../config/db');

// Increment views by a random number between MIN and MAX for target set
// Usage:
//  node src/backend/scripts/increment_random_views.js            -> all recipes
//  node src/backend/scripts/increment_random_views.js 1,2,3      -> only listed recipe IDs
//  MIN/MAX can be customized via env: RAND_MIN, RAND_MAX

const args = process.argv[2] || '';
const targetIds = args ? args.split(',').map(s => parseInt(s, 10)).filter(n => !isNaN(n)) : [];
const MIN = parseInt(process.env.RAND_MIN || '5', 10);
const MAX = parseInt(process.env.RAND_MAX || '20', 10);

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function runForAll() {
  const select = 'SELECT id FROM cong_thuc';
  db.query(select, (err, rows) => {
    if (err) {
      console.error('❌ Lỗi lấy danh sách công thức:', err.message);
      process.exit(1);
    }
    const ids = rows.map(r => r.id);
    incrementBatch(ids);
  });
}

function incrementBatch(ids) {
  if (!ids || ids.length === 0) {
    console.log('ℹ️ Không có công thức nào để cập nhật.');
    process.exit(0);
  }
  let done = 0;
  let totalAdded = 0;
  ids.forEach(id => {
    const add = randInt(MIN, MAX);
    db.query('UPDATE cong_thuc SET views = COALESCE(views,0) + ? WHERE id = ?', [add, id], (uErr) => {
      done++;
      if (!uErr) totalAdded += add;
      if (uErr) console.warn(`⚠️ Không thể cập nhật recipe ${id}:`, uErr.message);
      if (done === ids.length) {
        console.log(`✅ Đã tăng ngẫu nhiên lượt xem cho ${ids.length} công thức. Tổng cộng +${totalAdded} views.`);
        process.exit(0);
      }
    });
  });
}

if (targetIds.length > 0) {
  incrementBatch(targetIds);
} else {
  runForAll();
}
