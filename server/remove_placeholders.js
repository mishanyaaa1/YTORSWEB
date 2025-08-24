const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite3');

console.log('🗑️ Удаляем заглушки из базы данных...\n');

// Удаляем заглушки
db.run(`DELETE FROM product_images WHERE 
  image_data LIKE "%placeholder%" OR 
  image_data LIKE "%no-img%" OR 
  image_data LIKE "%ytors.ru%" OR
  image_data LIKE "%no-image%" OR
  image_data LIKE "%заглушка%"`, function(err) {
  
  if (err) {
    console.error('❌ Ошибка при удалении:', err);
  } else {
    console.log(`✅ Удалено заглушек: ${this.changes}`);
    
    if (this.changes > 0) {
      console.log('\n🔄 Проверяем результат...');
      
      // Проверяем, что заглушки действительно удалены
      db.all(`SELECT COUNT(*) as count FROM product_images WHERE 
        image_data LIKE "%placeholder%" OR 
        image_data LIKE "%no-img%" OR 
        image_data LIKE "%ytors.ru%" OR
        image_data LIKE "%no-image%" OR
        image_data LIKE "%заглушка%"`, (err, rows) => {
        
        if (err) {
          console.error('❌ Ошибка при проверке:', err);
        } else {
          const remaining = rows[0].count;
          if (remaining === 0) {
            console.log('✅ Все заглушки успешно удалены!');
          } else {
            console.log(`⚠️ Осталось заглушек: ${remaining}`);
          }
        }
        
        db.close();
      });
    } else {
      console.log('ℹ️ Заглушек для удаления не найдено');
      db.close();
    }
  }
});
