// Скрипт для обновления SQL запросов с SQLite на PostgreSQL
const fs = require('fs');

// Читаем файл index.js
let content = fs.readFileSync('index.js', 'utf8');

// Заменяем все вызовы функций базы данных
// Убираем первый параметр db из всех вызовов
content = content.replace(/await (run|get|all)\(db,/g, 'await $1(');

// Заменяем плейсхолдеры ? на $1, $2, $3...
content = content.replace(/\?/g, (match, offset) => {
  // Подсчитываем количество ? до текущей позиции в строке
  const beforeCurrent = content.substring(0, offset);
  const questionMarks = (beforeCurrent.match(/\?/g) || []).length;
  return `$${questionMarks + 1}`;
});

// Заменяем SQLite специфичные функции на PostgreSQL
content = content.replace(/datetime\('now'\)/g, 'NOW()');
content = content.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');
content = content.replace(/INTEGER NOT NULL DEFAULT 0/g, 'BOOLEAN NOT NULL DEFAULT false');
content = content.replace(/INTEGER NOT NULL DEFAULT 1/g, 'BOOLEAN NOT NULL DEFAULT true');
content = content.replace(/INTEGER DEFAULT 0/g, 'BOOLEAN DEFAULT false');
content = content.replace(/INTEGER DEFAULT 1/g, 'BOOLEAN DEFAULT true');

// Заменяем PRAGMA команды (PostgreSQL не поддерживает)
content = content.replace(/await run\(db, 'PRAGMA foreign_keys = OFF'\);/g, '// PRAGMA not needed in PostgreSQL');
content = content.replace(/await run\(db, 'PRAGMA foreign_keys = ON'\);/g, '// PRAGMA not needed in PostgreSQL');

// Заменяем BEGIN TRANSACTION на BEGIN
content = content.replace(/BEGIN TRANSACTION/g, 'BEGIN');

// Заменяем COMMIT и ROLLBACK
content = content.replace(/await run\(db, 'COMMIT'\);/g, 'await run(\'COMMIT\');');
content = content.replace(/await run\(db, 'ROLLBACK'\);/g, 'await run(\'ROLLBACK\');');

// Записываем обновленный файл
fs.writeFileSync('index_pg.js', content);
console.log('Файл index_pg.js создан с обновленными запросами для PostgreSQL');
