// Переключатель между SQLite и PostgreSQL
const fs = require('fs');
const path = require('path');

const DB_SQLITE = 'sqlite';
const DB_POSTGRES = 'postgres';

// Определяем какой тип базы данных использовать
function getDatabaseType() {
  // Проверяем переменную окружения
  if (process.env.DATABASE_TYPE) {
    return process.env.DATABASE_TYPE;
  }
  
  // Проверяем наличие файла .env
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbTypeMatch = envContent.match(/DATABASE_TYPE=(.+)/);
    if (dbTypeMatch) {
      return dbTypeMatch[1].trim();
    }
  }
  
  // По умолчанию используем SQLite
  return DB_SQLITE;
}

// Экспортируем соответствующий модуль базы данных
const dbType = getDatabaseType();

console.log(`Используется база данных: ${dbType}`);

if (dbType === DB_POSTGRES) {
  module.exports = require('./db_postgres');
  module.exports.dbType = DB_POSTGRES;
} else {
  module.exports = require('./db');
  module.exports.dbType = DB_SQLITE;
}

module.exports.DB_TYPES = {
  SQLITE: DB_SQLITE,
  POSTGRES: DB_POSTGRES
};
