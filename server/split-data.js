// Скрипт для разделения данных на части
const fs = require('fs');

// Читаем экспортированные данные
const data = JSON.parse(fs.readFileSync('exported-data.json', 'utf8'));

// Создаем отдельные файлы для каждой таблицы
const tables = [
  'categories', 'subcategories', 'brands', 'products', 
  'productImages', 'promotions', 'customers', 'orders', 
  'orderItems', 'orderNotes', 'advertisingSettings', 
  'botSettings', 'terrainTypes', 'vehicleTypes'
];

tables.forEach(table => {
  if (data[table] && data[table].length > 0) {
    const tableData = { [table]: data[table] };
    fs.writeFileSync(`${table}.json`, JSON.stringify(tableData, null, 2));
    console.log(`✅ Создан файл ${table}.json (${data[table].length} записей)`);
  }
});

console.log('🎉 Все файлы созданы!');
