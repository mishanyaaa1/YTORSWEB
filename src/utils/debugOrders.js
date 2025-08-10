// Утилита для диагностики проблем с заказами

// Проверка localStorage
export const checkOrdersInStorage = () => {
  try {
    const orders = localStorage.getItem('orders');
    console.log('🔍 Заказы в localStorage:', orders);
    if (orders) {
      const parsed = JSON.parse(orders);
      console.log('📋 Распарсенные заказы:', parsed);
      console.log('📊 Количество заказов:', parsed.length);
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('❌ Ошибка проверки localStorage:', error);
    return [];
  }
};

// Очистка заказов (для тестирования)
export const clearOrdersStorage = () => {
  localStorage.removeItem('orders');
  console.log('🗑️ Заказы очищены из localStorage');
};

// Добавление тестового заказа
export const addTestOrder = () => {
  const testOrder = {
    id: 'TEST123',
    orderNumber: 'TEST123',
    status: 'new',
    customerInfo: {
      name: 'Тестовый клиент',
      phone: '+7 (999) 123-45-67',
      email: 'test@example.com'
    },
    items: [
      {
        id: 1,
        title: 'Тестовый товар',
        price: 1000,
        quantity: 1
      }
    ],
    pricing: {
      subtotal: 1000,
      total: 1000
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: []
  };

  try {
    const existingOrders = checkOrdersInStorage();
    const newOrders = [testOrder, ...existingOrders];
    localStorage.setItem('orders', JSON.stringify(newOrders));
    console.log('✅ Тестовый заказ добавлен:', testOrder);
    return testOrder;
  } catch (error) {
    console.error('❌ Ошибка добавления тестового заказа:', error);
    return null;
  }
};

// Глобальные функции для консоли браузера
if (typeof window !== 'undefined') {
  window.debugOrders = {
    check: checkOrdersInStorage,
    clear: clearOrdersStorage,
    addTest: addTestOrder
  };
  
  console.log(`
🔧 Утилиты диагностики заказов доступны в консоли:

📋 window.debugOrders.check() - проверить заказы в localStorage
🗑️ window.debugOrders.clear() - очистить заказы
✅ window.debugOrders.addTest() - добавить тестовый заказ

Пример использования:
> window.debugOrders.check()
> window.debugOrders.addTest()
> window.debugOrders.check()
  `);
}

export default {
  checkOrdersInStorage,
  clearOrdersStorage,
  addTestOrder
};
