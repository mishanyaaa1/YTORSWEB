const { db } = require('./db');

db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Tables:', rows.map(r => r.name));
  }
  
  // Проверим есть ли таблицы vehicles и site_content
  db.all('SELECT COUNT(*) as count FROM vehicles', (err, result) => {
    if (err) {
      console.log('Vehicles table not found or error:', err.message);
    } else {
      console.log('Vehicles count:', result[0].count);
    }
  });
  
  db.all('SELECT COUNT(*) as count FROM site_content', (err, result) => {
    if (err) {
      console.log('Site_content table not found or error:', err.message);
    } else {
      console.log('Site_content count:', result[0].count);
    }
  });
});
