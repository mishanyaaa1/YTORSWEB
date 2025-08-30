const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite3');
const db = new sqlite3.Database(dbPath);

console.log('Обновляю email получателя...');

const recipientEmail = 'i.am31827@gmail.com';

db.run("UPDATE email_settings SET recipient_email = ?, updated_at = datetime('now') WHERE id = 1", [recipientEmail], function(err) {
  if (err) {
    console.error('Ошибка обновления:', err);
  } else {
    console.log('Email обновлен успешно!');
    console.log('Изменено записей:', this.changes);
    
    // Проверяем результат
    db.get("SELECT * FROM email_settings WHERE id = 1", (err, row) => {
      if (err) {
        console.error('Ошибка проверки:', err);
      } else {
        console.log('Обновленные настройки:', row);
      }
      db.close();
    });
  }
});
