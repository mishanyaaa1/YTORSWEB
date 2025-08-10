// Утилита для отправки уведомлений в Telegram

const TELEGRAM_BOT_TOKEN = '8220911923:AAHOV3xvBPioSoBh53bPfceJBBkFYk1aqu0';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Функция для получения информации о боте и его chat_id
export const getBotInfo = async () => {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/getMe`);
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
    const response = await fetch(`${TELEGRAM_API_URL}/getUpdates`);
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
    // Если chat_id не указан, пытаемся получить его из последних сообщений
    let targetChatId = chatId;
    
    if (!targetChatId) {
      const updates = await getUpdates();
      if (updates && updates.ok && updates.result.length > 0) {
        // Берем chat_id из последнего сообщения
        const lastMessage = updates.result[updates.result.length - 1];
        targetChatId = lastMessage.message?.chat?.id || lastMessage.channel_post?.chat?.id;
      }
    }
    
    if (!targetChatId) {
      console.error('Не удалось определить chat_id для отправки сообщения');
      return { success: false, error: 'Chat ID не найден' };
    }

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
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
