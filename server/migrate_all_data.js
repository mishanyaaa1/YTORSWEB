// Загружаем переменные окружения
require('./load_env');

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Конфигурация PostgreSQL
const pgConfig = {
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'ytorsweb',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: process.env.POSTGRES_PORT || 5432,
};

// Путь к SQLite базе
const sqlitePath = path.join(__dirname, 'db.sqlite3');

// Создаем подключения
const sqliteDb = new sqlite3.Database(sqlitePath);
const pgPool = new Pool(pgConfig);

// Обертки для промисов
function sqliteRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function sqliteGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function sqliteAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Функция для конвертации SQLite значений в PostgreSQL
function convertValue(value, columnType) {
  if (value === null || value === undefined) return null;
  
  // Конвертируем INTEGER поля в boolean для соответствующих колонок
  const booleanColumns = ['available', 'enabled', 'featured', 'active', 'is_main'];
  if (booleanColumns.some(col => columnType.includes(col))) {
    return value === 1 || value === '1' || value === true;
  }
  
  // Конвертируем даты
  if (columnType.includes('created_at') || columnType.includes('updated_at') || 
      columnType.includes('timestamp') || columnType.includes('valid_')) {
    if (typeof value === 'string' && value.includes('T')) {
      return value;
    }
    return value;
  }
  
  return value;
}

// Функция миграции таблицы с отключенными внешними ключами
async function migrateTable(tableName, client) {
  console.log(`Мигрируем таблицу: ${tableName}`);
  
  try {
    const rows = await sqliteAll(`SELECT * FROM ${tableName}`);
    
    if (rows.length === 0) {
      console.log(`  Таблица ${tableName} пуста, пропускаем`);
      return;
    }
    
    console.log(`  Найдено ${rows.length} записей`);
    
    // Получаем структуру таблицы
    const tableInfo = await sqliteAll(`PRAGMA table_info(${tableName})`);
    
    for (const row of rows) {
      const columns = [];
      const values = [];
      const placeholders = [];
      
      for (let i = 0; i < tableInfo.length; i++) {
        const column = tableInfo[i];
        const value = row[column.name];
        
        if (value !== undefined) {
          columns.push(column.name);
          values.push(convertValue(value, column.name));
          placeholders.push(`$${values.length}`);
        }
      }
      
      const insertQuery = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT DO NOTHING
      `;
      
      await client.query(insertQuery, values);
    }
    
    console.log(`  ✓ Таблица ${tableName} успешно мигрирована`);
    
  } catch (error) {
    console.error(`  ✗ Ошибка при миграции таблицы ${tableName}:`, error.message);
    throw error;
  }
}

// Основная функция миграции
async function migrate() {
  console.log('Начинаем миграцию всех данных из SQLite в PostgreSQL...');
  console.log('Конфигурация PostgreSQL:', {
    host: pgConfig.host,
    database: pgConfig.database,
    port: pgConfig.port,
    user: pgConfig.user
  });
  
  const client = await pgPool.connect();
  
  try {
    // Проверяем подключение к PostgreSQL
    console.log('✓ Подключение к PostgreSQL установлено');
    
    // Отключаем проверку внешних ключей
    await client.query('SET session_replication_role = replica;');
    console.log('✓ Отключена проверка внешних ключей');
    
    // Проверяем SQLite базу
    const tables = await sqliteAll("SELECT name FROM sqlite_master WHERE type='table'");
    console.log(`✓ Найдено ${tables.length} таблиц в SQLite`);
    
    // Список таблиц для миграции в правильном порядке (учитывая зависимости)
    const migrationOrder = [
      'categories',
      'subcategories', 
      'brands',
      'terrain_types',
      'vehicle_types',
      'products',
      'product_images',
      'promotions',
      'customers',
      'orders',
      'order_items',
      'order_notes',
      'admins',
      'advertising_settings',
      'advertising_events',
      'vehicles',
      'vehicle_images',
      'site_content',
      'popular_products',
      'filter_settings',
      'promocodes',
      'bot_settings',
      'email_settings'
    ];
    
    // Мигрируем таблицы по порядку
    for (const tableName of migrationOrder) {
      if (tables.some(t => t.name === tableName)) {
        await migrateTable(tableName, client);
      } else {
        console.log(`  Таблица ${tableName} не найдена в SQLite, пропускаем`);
      }
    }
    
    // Включаем обратно проверку внешних ключей
    await client.query('SET session_replication_role = DEFAULT;');
    console.log('✓ Включена обратно проверка внешних ключей');
    
    console.log('\n✓ Миграция всех данных завершена успешно!');
    
  } catch (error) {
    console.error('✗ Ошибка при миграции:', error);
    throw error;
  } finally {
    // Закрываем подключения
    client.release();
    sqliteDb.close();
    await pgPool.end();
  }
}

// Запускаем миграцию
if (require.main === module) {
  migrate().catch(console.error);
}

module.exports = { migrate };
