// Интерактивный просмотрщик PostgreSQL базы данных
require('./load_env');
const { all, get } = require('./db_switch');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗄️ Интерактивный просмотр PostgreSQL базы данных\n');

async function showMainMenu() {
  console.log('📋 Главное меню:');
  console.log('1. Показать все таблицы');
  console.log('2. Просмотреть товары');
  console.log('3. Просмотреть вездеходы');
  console.log('4. Просмотреть заказы');
  console.log('5. Просмотреть категории');
  console.log('6. Выполнить SQL запрос');
  console.log('7. Статистика базы данных');
  console.log('0. Выход\n');
  
  rl.question('Выберите опцию (0-7): ', handleMainMenu);
}

async function handleMainMenu(choice) {
  console.log('\n' + '─'.repeat(50) + '\n');
  
  switch (choice) {
    case '1':
      await showTables();
      break;
    case '2':
      await showProducts();
      break;
    case '3':
      await showVehicles();
      break;
    case '4':
      await showOrders();
      break;
    case '5':
      await showCategories();
      break;
    case '6':
      await runCustomQuery();
      break;
    case '7':
      await showStatistics();
      break;
    case '0':
      console.log('👋 До свидания!');
      rl.close();
      return;
    default:
      console.log('❌ Неверный выбор');
  }
  
  console.log('\n' + '─'.repeat(50) + '\n');
  rl.question('Нажмите Enter для продолжения...', () => {
    showMainMenu();
  });
}

async function showTables() {
  console.log('📊 Все таблицы в базе данных:');
  try {
    const tables = await all(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name} (${table.columns_count} колонок)`);
    });
    
    console.log(`\nВсего таблиц: ${tables.length}`);
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
}

async function showProducts() {
  console.log('📦 Товары:');
  try {
    const products = await all('SELECT id, title, price, available FROM products ORDER BY id LIMIT 10');
    
    console.log('ID | Название | Цена | Доступен');
    console.log('─'.repeat(60));
    
    products.forEach(p => {
      const available = p.available ? '✅' : '❌';
      console.log(`${p.id.toString().padEnd(3)} | ${p.title.padEnd(25)} | ${p.price.toString().padEnd(8)} | ${available}`);
    });
    
    const total = await get('SELECT COUNT(*) as count FROM products');
    console.log(`\nВсего товаров: ${total.count}`);
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
}

async function showVehicles() {
  console.log('🚗 Вездеходы:');
  try {
    const vehicles = await all('SELECT id, name, type, terrain, price, available FROM vehicles ORDER BY id');
    
    console.log('ID | Название | Тип | Местность | Цена | Доступен');
    console.log('─'.repeat(80));
    
    vehicles.forEach(v => {
      const available = v.available ? '✅' : '❌';
      console.log(`${v.id.toString().padEnd(3)} | ${v.name.padEnd(12)} | ${v.type.padEnd(8)} | ${v.terrain.padEnd(10)} | ${v.price.toString().padEnd(8)} | ${available}`);
    });
    
    console.log(`\nВсего вездеходов: ${vehicles.length}`);
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
}

async function showOrders() {
  console.log('📋 Заказы:');
  try {
    const orders = await all(`
      SELECT o.id, o.order_number, o.status, o.created_at, c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `);
    
    console.log('Номер заказа | Статус | Клиент | Дата создания');
    console.log('─'.repeat(70));
    
    orders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('ru-RU');
      console.log(`${o.order_number.padEnd(12)} | ${o.status.padEnd(6)} | ${(o.customer_name || 'N/A').padEnd(15)} | ${date}`);
    });
    
    console.log(`\nВсего заказов: ${orders.length}`);
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
}

async function showCategories() {
  console.log('📂 Категории и подкатегории:');
  try {
    const categories = await all(`
      SELECT c.id, c.name as category_name,
             COUNT(s.id) as subcategories_count
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      GROUP BY c.id, c.name
      ORDER BY c.id
    `);
    
    categories.forEach(c => {
      console.log(`${c.id}. ${c.category_name} (${c.subcategories_count} подкатегорий)`);
    });
    
    const subcategories = await all('SELECT COUNT(*) as count FROM subcategories');
    console.log(`\nВсего категорий: ${categories.length}`);
    console.log(`Всего подкатегорий: ${subcategories[0].count}`);
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
}

async function runCustomQuery() {
  console.log('💻 Выполнение SQL запроса:');
  console.log('Примеры запросов:');
  console.log('• SELECT * FROM products WHERE price > 1000 LIMIT 5;');
  console.log('• SELECT COUNT(*) FROM products;');
  console.log('• SELECT name, type FROM vehicles;');
  console.log('• \\q для выхода\n');
  
  rl.question('Введите SQL запрос: ', async (query) => {
    if (query.toLowerCase() === '\\q') {
      showMainMenu();
      return;
    }
    
    try {
      console.log('\n🔍 Результат:');
      console.log('─'.repeat(50));
      
      const result = await all(query);
      
      if (result.length === 0) {
        console.log('Запрос выполнен, но результатов нет.');
      } else {
        // Показываем первые 10 результатов
        const displayResult = result.slice(0, 10);
        
        displayResult.forEach((row, index) => {
          console.log(`${index + 1}.`, JSON.stringify(row, null, 2));
        });
        
        if (result.length > 10) {
          console.log(`\n... и еще ${result.length - 10} записей`);
        }
        
        console.log(`\nВсего записей: ${result.length}`);
      }
      
    } catch (error) {
      console.log(`❌ Ошибка выполнения запроса: ${error.message}`);
    }
    
    console.log('\n' + '─'.repeat(50) + '\n');
    rl.question('Нажмите Enter для продолжения...', () => {
      showMainMenu();
    });
  });
}

async function showStatistics() {
  console.log('📊 Статистика базы данных:');
  try {
    const stats = await all(`
      SELECT 
        'products' as table_name, COUNT(*) as count FROM products
      UNION ALL
      SELECT 'vehicles', COUNT(*) FROM vehicles
      UNION ALL
      SELECT 'categories', COUNT(*) FROM categories
      UNION ALL
      SELECT 'subcategories', COUNT(*) FROM subcategories
      UNION ALL
      SELECT 'brands', COUNT(*) FROM brands
      UNION ALL
      SELECT 'orders', COUNT(*) FROM orders
      UNION ALL
      SELECT 'customers', COUNT(*) FROM customers
      UNION ALL
      SELECT 'promotions', COUNT(*) FROM promotions
      ORDER BY table_name
    `);
    
    console.log('Таблица | Количество записей');
    console.log('─'.repeat(30));
    
    stats.forEach(stat => {
      console.log(`${stat.table_name.padEnd(12)} | ${stat.count}`);
    });
    
    // Дополнительная статистика
    const totalProducts = await get('SELECT COUNT(*) as count FROM products');
    const availableProducts = await get('SELECT COUNT(*) as count FROM products WHERE available = true');
    const totalValue = await get('SELECT SUM(price) as total FROM products WHERE available = true');
    
    console.log('\n📦 Статистика товаров:');
    console.log(`Всего товаров: ${totalProducts.count}`);
    console.log(`Доступных товаров: ${availableProducts.count}`);
    console.log(`Общая стоимость: ${totalValue.total?.toLocaleString('ru-RU')} руб.`);
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
}

// Запускаем меню
showMainMenu();
