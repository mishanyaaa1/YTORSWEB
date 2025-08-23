const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Открываем базу данных
const dbPath = path.join(__dirname, 'server', 'db.sqlite3');
const db = new sqlite3.Database(dbPath);

// Читаем SQL миграции
const migrationPath = path.join(__dirname, 'server', 'migrations', '002_vehicles.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('🚗 Применяю миграцию для вездеходов...');

// Выполняем миграцию
db.exec(migrationSQL, function(err) {
  if (err) {
    console.error('❌ Ошибка при применении миграции:', err);
  } else {
    console.log('✅ Миграция вездеходов успешно применена!');
    
    // Проверяем созданные таблицы
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('vehicles', 'vehicle_images')", (err, tables) => {
      if (err) {
        console.error('Ошибка проверки таблиц:', err);
      } else {
        console.log('📋 Созданные таблицы:', tables.map(t => t.name));
      }
      db.close();
    });
  }
});
