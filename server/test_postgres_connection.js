// Тест подключения к PostgreSQL
require('./load_env');
const { all, dbType } = require('./db_switch');

async function testConnection() {
  console.log(`Тип базы данных: ${dbType}`);
  
  try {
    // Проверяем основные таблицы
    const products = await all('SELECT COUNT(*) as count FROM products');
    const vehicles = await all('SELECT COUNT(*) as count FROM vehicles');
    const categories = await all('SELECT COUNT(*) as count FROM categories');
    
    console.log('✅ Подключение к PostgreSQL работает!');
    console.log(`📦 Товаров: ${products[0].count}`);
    console.log(`🚗 Вездеходов: ${vehicles[0].count}`);
    console.log(`📂 Категорий: ${categories[0].count}`);
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
  }
}

testConnection();
