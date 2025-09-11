const fs = require('fs');
const path = require('path');
const { db, run } = require('./db');

async function applyMigration() {
  try {
    console.log('Применяю миграцию для вездеходов и контента...');
    
    // Читаем файл миграции
    const migrationPath = path.join(__dirname, 'migrations', '004_vehicles_and_content.sql');
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
    const vehicles = await db.all("SELECT COUNT(*) as count FROM vehicles");
    const siteContent = await db.all("SELECT COUNT(*) as count FROM site_content");
    
    console.log('Количество вездеходов:', vehicles[0]?.count || 0);
    console.log('Количество записей контента:', siteContent[0]?.count || 0);
    
  } catch (error) {
    console.error('Ошибка при применении миграции:', error);
  } finally {
    db.close();
  }
}

applyMigration();
