// Сравнение данных между SQLite и PostgreSQL
require('./load_env');
const { all: pgAll, dbType } = require('./db_switch');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Сравнение данных SQLite vs PostgreSQL\n');

// Подключение к SQLite
const sqliteDb = new sqlite3.Database(path.join(__dirname, 'db.sqlite3'));

function sqliteAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function compareDatabases() {
  console.log(`Текущая активная БД: ${dbType}\n`);
  
  const tables = ['products', 'vehicles', 'categories', 'orders'];
  
  for (const table of tables) {
    console.log(`📊 Таблица: ${table}`);
    console.log('─'.repeat(50));
    
    try {
      // Данные из SQLite
      const sqliteData = await sqliteAll(`SELECT COUNT(*) as count FROM ${table}`);
      const sqliteCount = sqliteData[0]?.count || 0;
      
      // Данные из PostgreSQL
      const pgData = await pgAll(`SELECT COUNT(*) as count FROM ${table}`);
      const pgCount = pgData[0]?.count || 0;
      
      console.log(`SQLite:      ${sqliteCount} записей`);
      console.log(`PostgreSQL:  ${pgCount} записей`);
      
      if (sqliteCount === pgCount) {
        console.log('✅ Количество записей совпадает');
      } else {
        console.log('❌ Количество записей не совпадает!');
      }
      
      // Показываем пример записи из обеих БД
      if (sqliteCount > 0 && pgCount > 0) {
        try {
          const sqliteSample = await sqliteAll(`SELECT * FROM ${table} LIMIT 1`);
          const pgSample = await pgAll(`SELECT * FROM ${table} LIMIT 1`);
          
          console.log(`\nПример записи из SQLite:`);
          console.log(JSON.stringify(sqliteSample[0], null, 2));
          console.log(`\nПример записи из PostgreSQL:`);
          console.log(JSON.stringify(pgSample[0], null, 2));
        } catch (error) {
          console.log(`Ошибка получения примеров: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Ошибка: ${error.message}`);
    }
    
    console.log('\n');
  }
  
  console.log('🌐 Проверьте сайт:');
  console.log('1. Откройте http://localhost:5174');
  console.log('2. Проверьте каталог товаров');
  console.log('3. Проверьте админ панель');
  console.log('4. Все данные должны отображаться из PostgreSQL!');
  
  sqliteDb.close();
}

compareDatabases().catch(console.error);
