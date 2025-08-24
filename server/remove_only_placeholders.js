const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite3');

console.log('🗑️ ПРАВИЛЬНОЕ УДАЛЕНИЕ: Удаляем ТОЛЬКО заглушки no-img.png...\n');

// Удаляем ТОЛЬКО заглушки no-img.png
db.run(`DELETE FROM product_images WHERE 
  image_data LIKE "%no-img.png%"`, function(err) {
  
  if (err) {
    console.error('❌ Ошибка при удалении заглушек:', err);
  } else {
    console.log(`✅ Удалено заглушек no-img.png: ${this.changes}`);
    
    if (this.changes > 0) {
      console.log('\n🔄 Проверяем результат...');
      
      // Проверяем, что заглушки действительно удалены
      db.all(`SELECT COUNT(*) as count FROM product_images WHERE 
        image_data LIKE "%no-img.png%"`, (err, rows) => {
        
        if (err) {
          console.error('❌ Ошибка при проверке:', err);
        } else {
          const remaining = rows[0].count;
          if (remaining === 0) {
            console.log('✅ Все заглушки no-img.png успешно удалены!');
          } else {
            console.log(`⚠️ Осталось заглушек: ${remaining}`);
          }
        }
        
        // Показываем все оставшиеся изображения
        console.log('\n📸 Проверяем оставшиеся изображения:');
        db.all(`SELECT p.id, p.title, pi.image_data 
          FROM products p 
          JOIN product_images pi ON p.id = pi.product_id 
          ORDER BY p.id LIMIT 10`, (err, rows) => {
          
          if (err) {
            console.error('❌ Ошибка:', err);
          } else {
            console.log(`\n📋 Показываем первые 10 товаров с изображениями:`);
            rows.forEach(row => {
              const preview = row.image_data.length > 60 ? row.image_data.substring(0, 60) + '...' : row.image_data;
              console.log(`📦 ID: ${row.id} - ${row.title}`);
              console.log(`   📷 ${preview}`);
            });
          }
          
          db.close();
        });
      });
    } else {
      console.log('ℹ️ Заглушек no-img.png для удаления не найдено');
      db.close();
    }
  }
});
