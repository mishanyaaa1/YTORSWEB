// Утилита для отправки уведомлений на email

// Функция для получения настроек email из базы данных
export const getEmailSettings = async () => {
  try {
    const response = await fetch('/api/admin/email');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Ошибка получения настроек email');
  } catch (error) {
    console.error('Ошибка получения настроек email:', error);
    throw error;
  }
};

// Функция для отправки сообщения на email
export const sendEmailMessage = async (subject, message, recipientEmail = null) => {
  try {
    const response = await fetch('/api/admin/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, message, recipient_email: recipientEmail }),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Ошибка отправки email');
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    throw error;
  }
};

// Функция для форматирования данных заказа в сообщение (аналогично телеграм боту)
export const formatOrderEmailMessage = (orderData) => {
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

  let message = `НОВЫЙ ЗАКАЗ #${orderNumber}\n\n`;
  
  // Информация о клиенте
  message += `ДАННЫЕ КЛИЕНТА:\n`;
  message += `• Имя: ${orderForm.name}\n`;
  message += `• Телефон: ${orderForm.phone}\n`;
  if (orderForm.email) {
    message += `• Email: ${orderForm.email}\n`;
  }
  
  // Способ получения
  message += `\nСПОСОБ ПОЛУЧЕНИЯ: ${orderForm.deliveryMethod === 'pickup' ? 'Самовывоз' : 'Доставка'}\n`;
  if (orderForm.deliveryMethod === 'delivery' && orderForm.address) {
    message += `АДРЕС ДОСТАВКИ: ${orderForm.address}\n`;
  }
  
  // Способ оплаты
  const paymentMethods = {
    'cash': 'Наличными',
    'card': 'Банковской картой',
    'transfer': 'Банковский перевод'
  };
  message += `СПОСОБ ОПЛАТЫ: ${paymentMethods[orderForm.paymentMethod]}\n`;
  
  // Комментарий
  if (orderForm.comment) {
    message += `КОММЕНТАРИЙ: ${orderForm.comment}\n`;
  }
  
  // Список товаров
  message += `\nЗАКАЗАННЫЕ ТОВАРЫ:\n`;
  cartItems.forEach((item, index) => {
    const total = item.price * item.quantity;
    message += `${index + 1}. ${item.title}\n`;
    if (item.brand) {
      message += `   Бренд: ${item.brand}\n`;
    }
    message += `   Цена: ${item.price.toLocaleString()} ₽ × ${item.quantity} шт = ${total.toLocaleString()} ₽\n\n`;
  });
  
  // Итоговая стоимость
  message += `РАСЧЕТ СТОИМОСТИ:\n`;
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
  message += `ИТОГО К ОПЛАТЕ: ${priceCalculation.total.toLocaleString()} ₽\n\n`;
  
  message += `ДАТА ЗАКАЗА: ${orderDate}\n`;
  message += `НОМЕР ЗАКАЗА: ${orderNumber}`;
  
  return message;
};
