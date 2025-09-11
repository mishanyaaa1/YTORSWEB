const { db } = require('./db');

async function checkImages() {
  try {
    console.log('=== Изображения вездеходов в БД ===\n');
    
    const rows = await db.all('SELECT id, name, image FROM vehicles ORDER BY id');
    
    rows.forEach(row => {
      console.log(`${row.id}. ${row.name}: ${row.image || 'NULL'}`);
    });
    
    console.log('\n=== Проверка файлов изображений ===');
    
    const fs = require('fs');
    const path = require('path');
    
    // Проверяем папку uploads
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log('\nФайлы в server/uploads:');
      files.forEach(file => console.log(`  - ${file}`));
    } else {
      console.log('\nПапка server/uploads не существует');
    }
    
    // Проверяем папку public/img/vehicles
    const publicVehiclesDir = path.join(__dirname, '..', 'public', 'img', 'vehicles');
    if (fs.existsSync(publicVehiclesDir)) {
      const files = fs.readdirSync(publicVehiclesDir);
      console.log('\nФайлы в public/img/vehicles:');
      files.forEach(file => console.log(`  - ${file}`));
    } else {
      console.log('\nПапка public/img/vehicles не существует');
    }
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    db.close();
  }
}

checkImages();
