const { db, run } = require('./db');

async function fixDatabase() {
  console.log('🔧 Исправляю базу данных...');
  
  try {
    // Создаем таблицу email_settings если её нет
    await run(db, `
      CREATE TABLE IF NOT EXISTS email_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient_email TEXT NOT NULL DEFAULT '',
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    
    // Вставляем настройки email
    await run(db, `
      INSERT OR REPLACE INTO email_settings (id, recipient_email, enabled) 
      VALUES (1, 'i.am31827@gmail.com', 1)
    `);
    
    // Проверяем результат
    const result = await db.all("SELECT * FROM email_settings");
    console.log('✅ База данных исправлена!');
    console.log('📧 Email настройки:', result);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

fixDatabase();
