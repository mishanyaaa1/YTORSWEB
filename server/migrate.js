/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { db, run } = require('./db');

async function applySqlFile(sqlFilePath) {
  const sql = fs.readFileSync(sqlFilePath, 'utf-8');
  // Разбиваем на отдельные стейтменты по ';' с фильтрацией пустых
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await run(db, stmt);
  }
}

async function main() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const full = path.join(migrationsDir, file);
      console.log('Applying migration', file);
      await applySqlFile(full);
    }
    console.log('Migrations applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();


