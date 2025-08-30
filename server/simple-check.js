const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite3');
const db = new sqlite3.Database(dbPath);

console.log('Проверяю базу данных...');

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
  if (err) {
    console.error('Ошибка:', err);
  } else {
    console.log('Все таблицы:', rows.map(r => r.name));
  }
  
  db.all("SELECT * FROM email_settings", (err, rows) => {
    if (err) {
      console.error('Ошибка email_settings:', err);
    } else {
      console.log('Данные email_settings:', rows);
    }
    db.close();
  });
});
