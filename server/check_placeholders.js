const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite3');

console.log('🔍 Проверяем наличие заглушек в базе данных...\n');

// Проверяем заглушки в изображениях товаров
db.all(`SELECT * FROM product_images WHERE 
  image_data LIKE "%placeholder%" OR 
  image_data LIKE "%no-img%" OR 
  image_data LIKE "%ytors.ru%" OR
  image_data LIKE "%no-image%" OR
  image_data LIKE "%заглушка%"`, (err, rows) => {
  
  if (err) {
    console.error('❌ Ошибка:', err);
  } else {
    console.log('📋 Найдено заглушек:', rows.length);
    if (rows.length > 0) {
      console.log('\n🚫 Найдены следующие заглушки:');
      rows.forEach(row => {
        console.log(`- ID: ${row.id}, Product ID: ${row.product_id}, Image: ${row.image_data.substring(0, 100)}...`);
      });
    } else {
      console.log('✅ Заглушек не найдено!');
    }
  }
  
  // Показываем все изображения товаров
  console.log('\n📸 Все изображения товаров:');
  db.all(`SELECT p.id, p.title, pi.image_data, pi.is_main 
    FROM products p 
    LEFT JOIN product_images pi ON p.id = pi.product_id 
    ORDER BY p.id, pi.is_main DESC`, (err, rows) => {
    
    if (err) {
      console.error('❌ Ошибка:', err);
    } else {
      let currentProduct = null;
      rows.forEach(row => {
        if (currentProduct !== row.id) {
          console.log(`\n📦 ID: ${row.id} - ${row.title}`);
          currentProduct = row.id;
        }
        if (row.image_data) {
          const isMain = row.is_main ? ' (ОСНОВНОЕ)' : '';
          const preview = row.image_data.length > 50 ? row.image_data.substring(0, 50) + '...' : row.image_data;
          console.log(`   📷 ${preview}${isMain}`);
        } else {
          console.log(`   ❌ НЕТ ИЗОБРАЖЕНИЙ`);
        }
      });
    }
    
    db.close();
  });
});
