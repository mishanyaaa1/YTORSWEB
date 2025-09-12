// Просмотр базы данных PostgreSQL
require('./load_env');
const { all, dbType } = require('./db_switch');

console.log('🗄️ Просмотр базы данных PostgreSQL\n');

async function viewDatabase() {
  console.log(`Тип БД: ${dbType}\n`);
  
  if (dbType !== 'postgres') {
    console.log('❌ Используется не PostgreSQL!');
    return;
  }
  
  // Список всех таблиц
  console.log('📋 Список таблиц:');
  console.log('─'.repeat(50));
  
  try {
    const tables = await all(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    tables.forEach(table => {
      console.log(`📊 ${table.table_name} (${table.columns_count} колонок)`);
    });
    
    console.log(`\nВсего таблиц: ${tables.length}\n`);
    
  } catch (error) {
    console.log(`❌ Ошибка получения списка таблиц: ${error.message}`);
    return;
  }
  
  // Статистика по данным
  console.log('📊 Статистика данных:');
  console.log('─'.repeat(50));
  
  const mainTables = [
    'products', 'vehicles', 'categories', 'subcategories', 
    'brands', 'orders', 'customers', 'promotions'
  ];
  
  for (const table of mainTables) {
    try {
      const result = await all(`SELECT COUNT(*) as count FROM ${table}`);
      const count = result[0]?.count || 0;
      console.log(`📦 ${table.padEnd(15)}: ${count} записей`);
    } catch (error) {
      console.log(`❌ ${table.padEnd(15)}: ошибка`);
    }
  }
  
  console.log('\n🔍 Примеры данных:');
  console.log('─'.repeat(50));
  
  // Товары
  try {
    const products = await all('SELECT id, title, price FROM products LIMIT 5');
    console.log('\n📦 Товары (первые 5):');
    products.forEach(p => {
      console.log(`   ${p.id}. ${p.title} - ${p.price} руб.`);
    });
  } catch (error) {
    console.log('❌ Ошибка получения товаров');
  }
  
  // Вездеходы
  try {
    const vehicles = await all('SELECT id, name, type, terrain, price FROM vehicles LIMIT 5');
    console.log('\n🚗 Вездеходы:');
    vehicles.forEach(v => {
      console.log(`   ${v.id}. ${v.name} (${v.type}, ${v.terrain}) - ${v.price} руб.`);
    });
  } catch (error) {
    console.log('❌ Ошибка получения вездеходов');
  }
  
  // Категории
  try {
    const categories = await all('SELECT id, name FROM categories ORDER BY id');
    console.log('\n📂 Категории:');
    categories.forEach(c => {
      console.log(`   ${c.id}. ${c.name}`);
    });
  } catch (error) {
    console.log('❌ Ошибка получения категорий');
  }
  
  // Заказы
  try {
    const orders = await all('SELECT id, order_number, status, created_at FROM orders ORDER BY created_at DESC LIMIT 3');
    console.log('\n📋 Последние заказы:');
    orders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('ru-RU');
      console.log(`   ${o.order_number} - ${o.status} (${date})`);
    });
  } catch (error) {
    console.log('❌ Ошибка получения заказов');
  }
  
  console.log('\n💡 Полезные команды для psql:');
  console.log('─'.repeat(50));
  console.log('psql -U postgres -d ytorsweb  # Подключиться к БД');
  console.log('\\dt                          # Список таблиц');
  console.log('\\d products                  # Структура таблицы products');
  console.log('SELECT * FROM products;      # Все товары');
  console.log('SELECT COUNT(*) FROM products; # Количество товаров');
  console.log('\\q                           # Выйти');
  
  console.log('\n🌐 Веб-интерфейсы:');
  console.log('─'.repeat(50));
  console.log('• pgAdmin 4 - графический интерфейс PostgreSQL');
  console.log('• Adminer - веб-интерфейс для БД');
  console.log('• DBeaver - универсальный клиент БД');
}

viewDatabase().catch(console.error);
