#!/usr/bin/env node

/**
 * Скрипт для получения Chat ID из Telegram
 * Помогает настроить бота для правильного чата
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Получение Chat ID для Telegram бота');
console.log('=====================================');
console.log('⚠️  ВНИМАНИЕ: Chat ID теперь определяется автоматически');
console.log('   Этот скрипт нужен только для диагностики');
console.log();

rl.question('Введите токен вашего бота: ', (token) => {
  if (!token || token.trim() === '') {
    console.log('❌ Токен не может быть пустым');
    rl.close();
    return;
  }

  console.log();
  console.log('📱 Теперь:');
  console.log('1. Добавьте бота в нужный чат/канал');
  console.log('2. Отправьте любое сообщение в чат');
  console.log('3. Нажмите Enter для получения Chat ID');
  console.log();

  rl.question('Нажмите Enter когда отправите сообщение...', async () => {
    try {
      console.log('🔍 Получение обновлений...');
      
      const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
      const data = await response.json();
      
      if (!data.ok) {
        console.log('❌ Ошибка получения обновлений:');
        console.log(`   ${data.description || 'Неизвестная ошибка'}`);
        rl.close();
        return;
      }

      if (!data.result || data.result.length === 0) {
        console.log('⚠️  Обновлений не найдено');
        console.log('   Убедитесь что:');
        console.log('   • Бот добавлен в чат');
        console.log('   • В чат отправлено сообщение');
        console.log('   • Прошло несколько секунд');
        rl.close();
        return;
      }

      console.log('✅ Найдены чаты:');
      console.log();

      const chats = new Map();
      
      data.result.forEach((update, index) => {
        const chat = update.message?.chat || update.channel_post?.chat;
        if (chat) {
          const chatId = chat.id;
          const chatType = chat.type || 'private';
          const chatTitle = chat.title || chat.first_name || chat.username || `Chat ${chatId}`;
          
          if (!chats.has(chatId)) {
            chats.set(chatId, {
              id: chatId,
              type: chatType,
              title: chatTitle,
              username: chat.username
            });
          }
        }
      });

      chats.forEach((chat, index) => {
        const typeEmoji = {
          'private': '👤',
          'group': '👥',
          'supergroup': '👥',
          'channel': '📢'
        };
        
        console.log(`${index + 1}. ${typeEmoji[chat.type] || '❓'} ${chat.title}`);
        console.log(`   ID: ${chat.id}`);
        if (chat.username) {
          console.log(`   Username: @${chat.username}`);
        }
        console.log(`   Тип: ${chat.type}`);
        console.log();
      });

      console.log('💡 Используйте Chat ID для настройки бота в админке');
      console.log('   Для приватных чатов используйте числовой ID');
      console.log('   Для каналов можно использовать @username');
      
    } catch (error) {
      console.log('❌ Ошибка получения обновлений:');
      console.log(`   ${error.message}`);
    }
    
    rl.close();
  });
});
