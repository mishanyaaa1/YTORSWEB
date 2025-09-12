const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function runMigration(migrationFile) {
  try {
    console.log(`Applying migration: ${migrationFile}`);
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Разделяем SQL на отдельные запросы
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await new Promise((resolve, reject) => {
          db.exec(statement, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    console.log(`✅ Migration ${migrationFile} applied successfully`);
  } catch (error) {
    console.error(`❌ Error applying migration ${migrationFile}:`, error);
    throw error;
  }
}

async function runAllMigrations() {
  try {
    console.log('Starting database migrations...');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    for (const migrationFile of migrationFiles) {
      await runMigration(migrationFile);
    }
    
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) console.error('Error closing database:', err);
    });
  }
}

runAllMigrations();
