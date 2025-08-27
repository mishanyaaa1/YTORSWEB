#!/usr/bin/env node

/**
 * Скрипт для тестирования Telegram бота
 * Используется для проверки настроек бота
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'database', 'ytorsweb.db');

// Создание подключения к базе
const db = new sqlite3.Database(dbPath);

console.log('🤖 Тестирование Telegram бота для YTORSWEB');
console.log('==========================================');
console.log();

// Проверяем настройки бота
db.get('SELECT bot_token, chat_id, enabled FROM bot_settings ORDER BY id DESC LIMIT 1', (err, row) => {
  if (err) {
    console.error('❌ Ошибка чтения настроек бота:', err.message);
    process.exit(1);
  }

  if (!row) {
    console.log('⚠️  Настройки бота не найдены');
    console.log('   Запустите сначала: npm run bot:setup');
    process.exit(1);
  }

  console.log('📋 Текущие настройки бота:');
  console.log(`   • Токен: ${row.bot_token ? '✅ Настроен' : '❌ Не настроен'}`);
  console.log(`   • Chat ID: ${row.chat_id ? '✅ Настроен' : '❌ Не настроен'}`);
  console.log(`   • Статус: ${row.enabled ? '🟢 Включен' : '🔴 Отключен'}`);
  console.log();

  if (!row.bot_token) {
    console.log('⚠️  Для тестирования необходимо настроить токен бота');
    console.log('   Войдите в админку и настройте бота');
    process.exit(1);
  }

  if (!row.chat_id) {
    console.log('⚠️  Chat ID не настроен');
    console.log('   Сначала настройте бота через админку');
    process.exit(1);
  }

  if (!row.enabled) {
    console.log('⚠️  Бот отключен в настройках');
    console.log('   Включите бота в админке для тестирования');
    process.exit(1);
  }

  console.log('🧪 Тестирование отправки сообщения...');
  
  // Тестируем отправку сообщения
  const testMessage = `🧪 <b>Тестовое сообщение</b>\n\nЭто тестовое сообщение для проверки настроек бота.\n\n📅 Время: ${new Date().toLocaleString('ru-RU')}\n✅ Бот работает корректно!`;
  
  fetch(`https://api.telegram.org/bot${row.bot_token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: row.chat_id,
      text: testMessage,
      parse_mode: 'HTML'
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.ok) {
      console.log('✅ Тестовое сообщение успешно отправлено!');
      console.log(`   Chat ID: ${row.chat_id}`);
      console.log(`   Время: ${new Date().toLocaleString('ru-RU')}`);
    } else {
      console.log('❌ Ошибка отправки сообщения:');
      console.log(`   ${data.description || 'Неизвестная ошибка'}`);
    }
  })
  .catch(error => {
    console.log('❌ Ошибка тестирования:');
    console.log(`   ${error.message}`);
  })
  .finally(() => {
    db.close();
    console.log();
    console.log('🏁 Тестирование завершено');
  });
});
