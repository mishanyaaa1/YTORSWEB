const fs = require('fs');
const path = require('path');
const { db, run } = require('./db');

async function applyMigration() {
  try {
    console.log('Применяю миграцию для типов местности и вездеходов...');
    
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
        await run(db, statement);
      }
    }
    
    console.log('Миграция успешно применена!');
    
    // Проверяем, что таблицы созданы
    const terrainTypes = await db.all("SELECT * FROM terrain_types");
    const vehicleTypes = await db.all("SELECT * FROM vehicle_types");
    
    console.log('Типы местности:', terrainTypes.map(t => t.name));
    console.log('Типы вездеходов:', vehicleTypes.map(v => v.name));
    
  } catch (error) {
    console.error('Ошибка при применении миграции:', error);
  } finally {
    db.close();
  }
}

applyMigration();
