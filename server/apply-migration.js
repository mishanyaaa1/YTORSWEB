const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

async function applyMigration() {
  let db;
  
  try {
    console.log('Применяю миграцию для типов местности и вездеходов...');
    
    // Создаем новое подключение к базе данных
    const dbPath = path.join(__dirname, 'db.sqlite3');
    db = new sqlite3.Database(dbPath);
    
    // Читаем файл миграции
    const migrationPath = path.join(__dirname, 'migrations', '003_terrain_vehicle_types.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Разбиваем SQL на отдельные команды
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Применяем каждую команду
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Выполняю:', statement.substring(0, 50) + '...');
        await new Promise((resolve, reject) => {
          db.run(statement, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    console.log('Миграция успешно применена!');
    
  } catch (error) {
    console.error('Ошибка при применении миграции:', error);
    process.exit(1);
  } finally {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Ошибка при закрытии базы данных:', err);
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }
}

applyMigration();
