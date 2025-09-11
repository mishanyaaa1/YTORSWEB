const { initialAboutContent } = require('./src/data/initialData.js');
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db.sqlite3');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Обновление контента в базе данных...');

// Функция для обновления контента
function updateContent() {
  return new Promise((resolve, reject) => {
    const contentData = {
      aboutContent: initialAboutContent
    };

    const sql = `
      INSERT OR REPLACE INTO site_content (key, data, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `;

    db.run(sql, ['aboutContent', JSON.stringify(contentData.aboutContent)], function(err) {
      if (err) {
        console.error('❌ Ошибка при обновлении контента:', err);
        reject(err);
      } else {
        console.log('✅ Контент успешно обновлен в базе данных');
        console.log('📊 Обновленные разделы:');
        console.log('  - Доставка и оплата');
        console.log('  - Контакты');
        console.log('  - Команда');
        console.log('  - Почему выбирают нас');
        console.log('  - История');
        console.log('  - Преимущества');
        resolve();
      }
    });
  });
}

// Запуск обновления
updateContent()
  .then(() => {
    console.log('🎉 Все данные успешно сохранены в базу данных!');
    db.close();
  })
  .catch((error) => {
    console.error('💥 Ошибка при сохранении данных:', error);
    db.close();
    process.exit(1);
  });
