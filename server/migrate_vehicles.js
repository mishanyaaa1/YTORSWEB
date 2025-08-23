const fs = require('fs');
const path = require('path');
const { db, run } = require('./db');

async function migrateVehicles() {
  try {
    console.log('🚗 Применение миграции для вездеходов...');
    
    // Читаем SQL файл миграции
    const migrationPath = path.join(__dirname, 'migrations', '002_vehicles.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Выполняем миграцию
    await run(db, migrationSQL);
    
    console.log('✅ Миграция вездеходов успешно применена!');
    
    // Проверяем что таблицы созданы
    const { all } = require('./db');
    const tables = await all(db, "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('vehicles', 'vehicle_images')");
    console.log('📋 Созданные таблицы:', tables.map(t => t.name));
    
  } catch (error) {
    console.error('❌ Ошибка при применении миграции:', error);
  } finally {
    db.close();
  }
}

migrateVehicles();
