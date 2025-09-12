// Проверка миграции данных
const { run, get, all, dbType } = require('./db_switch');

async function checkMigration() {
  console.log(`Проверяем миграцию для базы данных: ${dbType}`);
  console.log('=====================================\n');

  try {
    // Проверяем основные таблицы
    const tables = [
      'categories',
      'subcategories',
      'brands',
      'products',
      'product_images',
      'vehicles',
      'vehicle_types',
      'terrain_types',
      'orders',
      'customers',
      'promotions',
      'advertising_settings',
      'site_content',
      'promocodes',
      'filter_settings'
    ];

    console.log('Количество записей в таблицах:');
    console.log('--------------------------------');
    
    for (const table of tables) {
      try {
        const result = await all(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result[0]?.count || 0;
        console.log(`${table.padEnd(25)}: ${count}`);
      } catch (error) {
        console.log(`${table.padEnd(25)}: ОШИБКА - ${error.message}`);
      }
    }

    console.log('\n=====================================');
    
    // Проверяем несколько конкретных записей
    console.log('\nПроверка конкретных данных:');
    console.log('----------------------------');
    
    // Проверяем товары
    const products = await all('SELECT id, title, price FROM products LIMIT 3');
    console.log(`Товары (первые 3):`);
    products.forEach(p => {
      console.log(`  ID: ${p.id}, Название: ${p.title}, Цена: ${p.price}`);
    });
    
    // Проверяем вездеходы
    const vehicles = await all('SELECT id, name, type, terrain FROM vehicles LIMIT 3');
    console.log(`\nВездеходы (первые 3):`);
    vehicles.forEach(v => {
      console.log(`  ID: ${v.id}, Название: ${v.name}, Тип: ${v.type}, Местность: ${v.terrain}`);
    });
    
    // Проверяем заказы
    const orders = await all('SELECT id, order_number, status FROM orders LIMIT 3');
    console.log(`\nЗаказы (первые 3):`);
    orders.forEach(o => {
      console.log(`  ID: ${o.id}, Номер: ${o.order_number}, Статус: ${o.status}`);
    });

    console.log('\n✅ Проверка миграции завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка при проверке миграции:', error.message);
  }
}

// Запускаем проверку
if (require.main === module) {
  checkMigration().catch(console.error);
}

module.exports = { checkMigration };
