const db = require('../config/db');

const testEmails = [
  'testuser_cli_20251115@example.com',
  'testuser_cli_new_20251115@example.com'
];

(async () => {
  try {
    for (const email of testEmails) {
      const q = 'SELECT id, username, email FROM nguoi_dung WHERE email = ?';
      db.query(q, [email], (err, rows) => {
        if (err) {
          console.error('Error selecting user', err.message);
          return;
        }
        if (!rows || rows.length === 0) {
          console.log(`No user found for ${email}`);
          return;
        }

        const id = rows[0].id;
        db.query('DELETE FROM nguoi_dung WHERE id = ?', [id], (err2, res) => {
          if (err2) {
            console.error('Error deleting user', err2.message);
            return;
          }
          console.log(`Deleted user ${email} (id=${id}), affectedRows=${res.affectedRows}`);
        });
      });
    }
  } catch (err) {
    console.error('Unexpected error', err.message);
  } finally {
    // allow some time for async queries to finish
    setTimeout(() => process.exit(0), 800);
  }
})();
