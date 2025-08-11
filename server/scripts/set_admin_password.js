/* eslint-disable */
const { db, run, get } = require('../db');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const newPassword = process.argv[2] || process.env.ADMIN_PASSWORD;
    if (!newPassword) {
      console.error('Usage: node scripts/set_admin_password.js <newPassword>');
      process.exit(1);
    }

    await run(
      db,
      `CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    );

    const hash = await bcrypt.hash(newPassword, 12);
    const existing = await get(db, `SELECT id FROM admins WHERE username=?`, [username]);
    if (existing) {
      await run(db, `UPDATE admins SET password_hash=? WHERE id=?`, [hash, existing.id]);
      console.log(`Admin password updated for user '${username}'.`);
    } else {
      await run(db, `INSERT INTO admins (username, password_hash) VALUES (?, ?)`, [username, hash]);
      console.log(`Admin user '${username}' created with new password.`);
    }
    process.exit(0);
  } catch (e) {
    console.error('Failed to set admin password:', e);
    process.exit(1);
  }
}

main();


