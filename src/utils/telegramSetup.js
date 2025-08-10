// Утилиты для настройки Telegram бота

import { getBotInfo, getUpdates } from './telegramService';

// Функция для проверки статуса бота
export const checkBotStatus = async () => {
  console.log('🤖 Проверяем статус Telegram бота...');
  
  const botInfo = await getBotInfo();
  if (botInfo && botInfo.ok) {
    console.log('✅ Бот успешно подключен!');
    console.log('📋 Информация о боте:', {
      id: botInfo.result.id,
      username: botInfo.result.username,
      first_name: botInfo.result.first_name
    });
    return true;
  } else {
    console.error('❌ Ошибка подключения к боту');
    return false;
  }
};

// Функция для получения chat_id
export const getChatId = async () => {
  console.log('🔍 Получаем chat_id...');
  
  const updates = await getUpdates();
  if (updates && updates.ok && updates.result.length > 0) {
    const chatIds = new Set();
    
    updates.result.forEach(update => {
      const chatId = update.message?.chat?.id || update.channel_post?.chat?.id;
      if (chatId) {
        chatIds.add(chatId);
      }
    });
    
    if (chatIds.size > 0) {
      console.log('✅ Найдены chat_id:', Array.from(chatIds));
      return Array.from(chatIds);
    }
  }
  
  console.log('⚠️ Chat_id не найден. Убедитесь что:');
  console.log('1. Вы отправили сообщение боту');
  console.log('2. Бот добавлен в группу/канал');
  return [];
};

// Функция для тестирования отправки сообщения
export const testTelegramNotification = async () => {
  try {
    console.log('🧪 Тестируем отправку уведомления...');
    
    const testMessage = `
🧪 <b>ТЕСТОВОЕ СООБЩЕНИЕ</b>

Это тестовое сообщение для проверки интеграции с Telegram.

✅ Если вы получили это сообщение, то интеграция настроена правильно!

🕒 Время отправки: ${new Date().toLocaleString('ru-RU')}
`;
    
    const { sendTelegramMessage } = await import('./telegramService');
    const result = await sendTelegramMessage(testMessage);
    
    if (result.success) {
      console.log('✅ Тестовое сообщение успешно отправлено!');
      return true;
    } else {
      console.error('❌ Ошибка отправки тестового сообщения:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
    return false;
  }
};

// Инструкции по настройке бота
export const showSetupInstructions = () => {
  console.log(`
🤖 ИНСТРУКЦИЯ ПО НАСТРОЙКЕ TELEGRAM БОТА

1. Создайте бота через @BotFather в Telegram:
   - Отправьте команду /newbot
   - Придумайте имя и username для бота
   - Получите токен бота

2. Настройте получение уведомлений:
   
   Вариант А - Личные сообщения:
   - Найдите вашего бота в Telegram
   - Отправьте ему любое сообщение (например "/start")
   
   Вариант Б - Группа/канал:
   - Создайте группу или канал
   - Добавьте бота как администратора
   - Отправьте любое сообщение в группу/канал

3. Проверьте настройки:
   - Откройте консоль браузера (F12)
   - Выполните: window.telegramSetup.checkBotStatus()
   - Выполните: window.telegramSetup.getChatId()
   - Выполните: window.telegramSetup.testTelegramNotification()

4. Токен бота уже настроен в системе: 8220911923:AAHOV3xvBPioSoBh53bPfceJBBkFYk1aqu0

❗ ВАЖНО: Убедитесь что бот имеет права на отправку сообщений!
`);
};

// Экспортируем в глобальную область для тестирования из консоли
if (typeof window !== 'undefined') {
  window.telegramSetup = {
    checkBotStatus,
    getChatId, 
    testTelegramNotification,
    showSetupInstructions
  };
}

export default {
  checkBotStatus,
  getChatId,
  testTelegramNotification,
  showSetupInstructions
};
