// Проверка что сайт работает с PostgreSQL
require('./load_env');
const { all, dbType } = require('./db_switch');
const http = require('http');

console.log('🔍 Проверяем использование PostgreSQL...\n');

async function checkDatabase() {
  console.log('1. Проверка типа базы данных:');
  console.log(`   Тип БД: ${dbType}`);
  
  if (dbType === 'postgres') {
    console.log('   ✅ Используется PostgreSQL');
  } else {
    console.log('   ❌ Используется SQLite, а не PostgreSQL');
    return;
  }
  
  console.log('\n2. Проверка данных в PostgreSQL:');
  
  try {
    const products = await all('SELECT COUNT(*) as count FROM products');
    const vehicles = await all('SELECT COUNT(*) as count FROM vehicles');
    const orders = await all('SELECT COUNT(*) as count FROM orders');
    
    console.log(`   📦 Товаров: ${products[0].count}`);
    console.log(`   🚗 Вездеходов: ${vehicles[0].count}`);
    console.log(`   📋 Заказов: ${orders[0].count}`);
    
    // Проверяем конкретный товар
    const sampleProduct = await all('SELECT id, title, price FROM products LIMIT 1');
    if (sampleProduct.length > 0) {
      console.log(`   📄 Пример товара: "${sampleProduct[0].title}" (${sampleProduct[0].price} руб.)`);
    }
    
  } catch (error) {
    console.log(`   ❌ Ошибка получения данных: ${error.message}`);
    return;
  }
  
  console.log('\n3. Проверка API сервера:');
  
  try {
    // Проверяем API endpoint
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3001/api/products', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
    });
    
    if (response.status === 200) {
      const products = JSON.parse(response.data);
      console.log(`   ✅ API работает, получено ${products.length} товаров`);
      
      // Проверяем что данные реально из PostgreSQL
      if (products.length > 0) {
        console.log(`   📄 Первый товар из API: "${products[0].title}"`);
      }
    } else {
      console.log(`   ❌ API вернул статус: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Ошибка API: ${error.message}`);
  }
  
  console.log('\n4. Проверка информации о PostgreSQL:');
  
  try {
    // Получаем информацию о версии PostgreSQL
    const version = await all('SELECT version()');
    console.log(`   🐘 PostgreSQL версия: ${version[0].version.split(',')[0]}`);
    
    // Проверяем текущую базу данных
    const dbName = await all('SELECT current_database()');
    console.log(`   🗄️ Текущая БД: ${dbName[0].current_database}`);
    
  } catch (error) {
    console.log(`   ❌ Ошибка получения информации: ${error.message}`);
  }
  
  console.log('\n✅ Проверка завершена!');
  console.log('\n🌐 Откройте http://localhost:5174 для проверки сайта');
  console.log('📊 Все данные должны отображаться из PostgreSQL');
}

checkDatabase().catch(console.error);
