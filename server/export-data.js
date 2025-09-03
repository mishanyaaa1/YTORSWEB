// Скрипт для экспорта данных из SQLite в JSON
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Подключение к SQLite
const sqliteDb = new sqlite3.Database('./db.sqlite3');

// Функция для выполнения запросов к SQLite
function sqliteQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function exportData() {
  console.log('🚀 Экспортируем данные из SQLite...');
  
  try {
    const data = {};
    
    // Экспортируем все таблицы
    data.categories = await sqliteQuery('SELECT * FROM categories');
    data.subcategories = await sqliteQuery('SELECT * FROM subcategories');
    data.brands = await sqliteQuery('SELECT * FROM brands');
    data.products = await sqliteQuery('SELECT * FROM products');
    data.productImages = await sqliteQuery('SELECT * FROM product_images');
    data.promotions = await sqliteQuery('SELECT * FROM promotions');
    data.customers = await sqliteQuery('SELECT * FROM customers');
    data.orders = await sqliteQuery('SELECT * FROM orders');
    data.orderItems = await sqliteQuery('SELECT * FROM order_items');
    data.orderNotes = await sqliteQuery('SELECT * FROM order_notes');
    data.advertisingSettings = await sqliteQuery('SELECT * FROM advertising_settings');
    data.botSettings = await sqliteQuery('SELECT * FROM bot_settings');
    data.terrainTypes = await sqliteQuery('SELECT * FROM terrain_types');
    data.vehicleTypes = await sqliteQuery('SELECT * FROM vehicle_types');
    
    // Сохраняем в файл
    fs.writeFileSync('exported-data.json', JSON.stringify(data, null, 2));
    
    console.log('✅ Данные экспортированы в файл exported-data.json');
    console.log('📊 Статистика:');
    console.log(`   - Категории: ${data.categories.length}`);
    console.log(`   - Подкатегории: ${data.subcategories.length}`);
    console.log(`   - Бренды: ${data.brands.length}`);
    console.log(`   - Товары: ${data.products.length}`);
    console.log(`   - Изображения: ${data.productImages.length}`);
    console.log(`   - Акции: ${data.promotions.length}`);
    console.log(`   - Клиенты: ${data.customers.length}`);
    console.log(`   - Заказы: ${data.orders.length}`);
    console.log(`   - Элементы заказов: ${data.orderItems.length}`);
    console.log(`   - Заметки заказов: ${data.orderNotes.length}`);
    console.log(`   - Настройки рекламы: ${data.advertisingSettings.length}`);
    console.log(`   - Настройки бота: ${data.botSettings.length}`);
    console.log(`   - Типы местности: ${data.terrainTypes.length}`);
    console.log(`   - Типы вездеходов: ${data.vehicleTypes.length}`);
    
  } catch (error) {
    console.error('❌ Ошибка при экспорте данных:', error);
    throw error;
  } finally {
    sqliteDb.close();
  }
}

// Запускаем экспорт
exportData().catch(console.error);
