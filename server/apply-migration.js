const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Применяю миграции для PostgreSQL...');
    
    // Список миграций в порядке применения
    const migrations = [
      '001_init_pg.sql',
      '002_advertising_pg.sql', 
      '003_terrain_vehicle_types_pg.sql',
      '004_bot_settings_pg.sql'
    ];
    
    // Создаем таблицу для отслеживания примененных миграций
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    
    for (const migrationFile of migrations) {
      // Проверяем, была ли уже применена эта миграция
      const result = await client.query(
        'SELECT id FROM migrations WHERE filename = $1',
        [migrationFile]
      );
      
      if (result.rows.length > 0) {
        console.log(`Миграция ${migrationFile} уже применена, пропускаем...`);
        continue;
      }
      
      console.log(`Применяю миграцию: ${migrationFile}`);
      
      // Читаем файл миграции
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Разбиваем SQL на отдельные команды
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      // Применяем каждую команду в транзакции
      await client.query('BEGIN');
      
      try {
        for (const statement of statements) {
          if (statement.trim()) {
            console.log('Выполняю:', statement.substring(0, 50) + '...');
            await client.query(statement);
          }
        }
        
        // Отмечаем миграцию как примененную
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [migrationFile]
        );
        
        await client.query('COMMIT');
        console.log(`Миграция ${migrationFile} успешно применена!`);
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    
    console.log('Все миграции успешно применены!');
    
  } catch (error) {
    console.error('Ошибка при применении миграций:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

applyMigration();