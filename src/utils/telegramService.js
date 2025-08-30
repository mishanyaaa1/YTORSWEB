// Утилита для отправки уведомлений в Telegram
import { apiGet } from './api';
import { API_CONFIG } from '../config/api';

// Функция для получения настроек бота из базы данных
export const getBotSettings = async () => {
  try {
    const response = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_BOT);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения настроек бота:', error);
    return null;
  }
};

// Функция для получения информации о боте и его chat_id
export const getBotInfo = async () => {
  try {
    const settings = await getBotSettings();
    if (!settings || !settings.bot_token) {
      console.error('Токен бота не настроен');
      return null;
    }
    
    const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/getMe`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка получения информации о боте:', error);
    return null;
  }
};

// Функция для получения обновлений (для получения chat_id)
export const getUpdates = async () => {
  try {
    const settings = await getBotSettings();
    if (!settings || !settings.bot_token) {
      console.error('Токен бота не настроен');
      return null;
    }
    
    const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/getUpdates`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка получения обновлений:', error);
    return null;
  }
};

// Функция для отправки сообщения в Telegram
export const sendTelegramMessage = async (message, chatId = null) => {
  try {
    const settings = await getBotSettings();
    if (!settings || !settings.bot_token) {
      console.error('Токен бота не настроен');
      return { success: false, error: 'Токен бота не настроен' };
    }
    
    if (!settings.enabled) {
      console.log('Бот отключен в настройках');
      return { success: false, error: 'Бот отключен' };
    }
    
    // Если chat_id не указан, используем из настроек
    let targetChatId = chatId || settings.chat_id;
    
    if (!targetChatId) {
      // Пытаемся получить chat_id из последних сообщений
      const updates = await getUpdates();
      if (updates && updates.ok && updates.result.length > 0) {
        // Берем chat_id из последнего сообщения
        const lastMessage = updates.result[updates.result.length - 1];
        targetChatId = lastMessage.message?.chat?.id || lastMessage.channel_post?.chat?.id;
      }
    }
    
    if (!targetChatId) {
      console.error('Не удалось определить chat_id для отправки сообщения');
      return { success: false, error: 'Chat ID не настроен. Сначала настройте бота через админку.' };
    }

    const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('Сообщение успешно отправлено в Telegram');
      return { success: true, data };
    } else {
      console.error('Ошибка отправки сообщения в Telegram:', data);
      return { success: false, error: data.description };
    }
  } catch (error) {
    console.error('Ошибка при отправке сообщения в Telegram:', error);
    return { success: false, error: error.message };
  }
};

// Функция для форматирования данных заказа в сообщение
export const formatOrderMessage = (orderData) => {
  const {
    orderForm,
    cartItems,
    priceCalculation,
    orderNumber
  } = orderData;

  const orderDate = new Date().toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = `🛒 <b>НОВЫЙ ЗАКАЗ #${orderNumber}</b>\n\n`;
  
  // Информация о клиенте
  message += `👤 <b>Данные клиента:</b>\n`;
  message += `• Имя: ${orderForm.name}\n`;
  message += `• Телефон: ${orderForm.phone}\n`;
  if (orderForm.email) {
    message += `• Email: ${orderForm.email}\n`;
  }
  
  // Способ получения
  message += `\n📦 <b>Способ получения:</b> ${orderForm.deliveryMethod === 'pickup' ? 'Самовывоз' : 'Доставка'}\n`;
  if (orderForm.deliveryMethod === 'delivery' && orderForm.address) {
    message += `📍 <b>Адрес доставки:</b> ${orderForm.address}\n`;
  }
  
  // Способ оплаты
  const paymentMethods = {
    'cash': 'Наличными',
    'card': 'Банковской картой',
    'transfer': 'Банковский перевод'
  };
  message += `💳 <b>Способ оплаты:</b> ${paymentMethods[orderForm.paymentMethod]}\n`;
  
  // Комментарий
  if (orderForm.comment) {
    message += `💬 <b>Комментарий:</b> ${orderForm.comment}\n`;
  }
  
  // Список товаров
  message += `\n🛍️ <b>Заказанные товары:</b>\n`;
  cartItems.forEach((item, index) => {
    const total = item.price * item.quantity;
    message += `${index + 1}. ${item.title}\n`;
    if (item.brand) {
      message += `   Бренд: ${item.brand}\n`;
    }
    message += `   Цена: ${item.price.toLocaleString()} ₽ × ${item.quantity} шт = ${total.toLocaleString()} ₽\n\n`;
  });
  
  // Итоговая стоимость
  message += `💰 <b>Расчет стоимости:</b>\n`;
  message += `• Подытог: ${priceCalculation.subtotal.toLocaleString()} ₽\n`;
  
  if (priceCalculation.appliedPromotion) {
    message += `• Скидка "${priceCalculation.appliedPromotion.title}" (${priceCalculation.appliedPromotion.discount}%): -${priceCalculation.discountAmount.toLocaleString()} ₽\n`;
  }
  
  if (priceCalculation.appliedPromocode) {
    const promocodeType = priceCalculation.appliedPromocode.discountType === 'percent' ? '%' : '₽';
    const promocodeValue = priceCalculation.appliedPromocode.discountType === 'percent' 
      ? `${priceCalculation.appliedPromocode.discount}%` 
      : `${priceCalculation.appliedPromocode.discount.toLocaleString()} ₽`;
    
    message += `• Промокод "${priceCalculation.appliedPromocode.code}" (${promocodeValue}): -${priceCalculation.promocodeDiscount.toLocaleString()} ₽\n`;
    
    // Информация о суммировании с акциями
    if (priceCalculation.appliedPromocode.stackable) {
      message += `  └ Суммируется с акциями\n`;
    } else {
      message += `  └ Не суммируется с акциями\n`;
    }
  }
  
  message += `• Доставка: Бесплатно\n`;
  message += `<b>• ИТОГО К ОПЛАТЕ: ${priceCalculation.total.toLocaleString()} ₽</b>\n\n`;
  
  message += `📅 <b>Дата заказа:</b> ${orderDate}\n`;
  message += `🆔 <b>Номер заказа:</b> ${orderNumber}`;
  
  return message;
};

// Функция для генерации номера заказа
export const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${timestamp}${random}`.slice(-8); // Последние 8 цифр
};
