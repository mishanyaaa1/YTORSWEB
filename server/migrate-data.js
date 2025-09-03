// Скрипт для переноса данных из SQLite в PostgreSQL
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Подключение к SQLite
const sqliteDb = new sqlite3.Database('./db.sqlite3');

// Подключение к PostgreSQL
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Функция для выполнения запросов к PostgreSQL
async function pgQuery(sql, params = []) {
  const client = await pgPool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Функция для выполнения запросов к SQLite
function sqliteQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Функция для получения одной записи из SQLite
function sqliteGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function migrateData() {
  console.log('🚀 Начинаем миграцию данных из SQLite в PostgreSQL...');
  
  try {
    // 1. Мигрируем админов
    console.log('📋 Мигрируем админов...');
    const admins = await sqliteQuery('SELECT * FROM admins');
    for (const admin of admins) {
      await pgQuery(
        'INSERT INTO admins (id, username, password_hash, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [admin.id, admin.username, admin.password_hash, admin.created_at]
      );
    }
    console.log(`✅ Перенесено ${admins.length} админов`);

    // 2. Мигрируем категории
    console.log('📂 Мигрируем категории...');
    const categories = await sqliteQuery('SELECT * FROM categories');
    for (const category of categories) {
      await pgQuery(
        'INSERT INTO categories (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [category.id, category.name]
      );
    }
    console.log(`✅ Перенесено ${categories.length} категорий`);

    // 3. Мигрируем подкатегории
    console.log('📁 Мигрируем подкатегории...');
    const subcategories = await sqliteQuery('SELECT * FROM subcategories');
    for (const subcategory of subcategories) {
      await pgQuery(
        'INSERT INTO subcategories (id, category_id, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [subcategory.id, subcategory.category_id, subcategory.name]
      );
    }
    console.log(`✅ Перенесено ${subcategories.length} подкатегорий`);

    // 4. Мигрируем бренды
    console.log('🏷️ Мигрируем бренды...');
    const brands = await sqliteQuery('SELECT * FROM brands');
    for (const brand of brands) {
      await pgQuery(
        'INSERT INTO brands (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [brand.id, brand.name]
      );
    }
    console.log(`✅ Перенесено ${brands.length} брендов`);

    // 5. Мигрируем товары
    console.log('🛍️ Мигрируем товары...');
    const products = await sqliteQuery('SELECT * FROM products');
    for (const product of products) {
      await pgQuery(
        `INSERT INTO products (id, title, price, category_id, subcategory_id, brand_id, 
         available, quantity, description, specifications_json, features_json, 
         created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         ON CONFLICT (id) DO NOTHING`,
        [
          product.id, product.title, product.price, product.category_id, 
          product.subcategory_id, product.brand_id, 
          product.available === 1, product.quantity, product.description, 
          product.specifications_json, product.features_json, 
          product.created_at, product.updated_at
        ]
      );
    }
    console.log(`✅ Перенесено ${products.length} товаров`);

    // 6. Мигрируем изображения товаров
    console.log('🖼️ Мигрируем изображения товаров...');
    const productImages = await sqliteQuery('SELECT * FROM product_images');
    for (const image of productImages) {
      await pgQuery(
        'INSERT INTO product_images (id, product_id, image_data, is_main) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [image.id, image.product_id, image.image_data, image.is_main === 1]
      );
    }
    console.log(`✅ Перенесено ${productImages.length} изображений`);

    // 7. Мигрируем акции
    console.log('🎯 Мигрируем акции...');
    const promotions = await sqliteQuery('SELECT * FROM promotions');
    for (const promotion of promotions) {
      await pgQuery(
        `INSERT INTO promotions (id, title, description, discount, category_id, 
         valid_until, active, featured, min_purchase) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO NOTHING`,
        [
          promotion.id, promotion.title, promotion.description, promotion.discount, 
          promotion.category_id, promotion.valid_until, 
          promotion.active === 1, promotion.featured === 1, promotion.min_purchase
        ]
      );
    }
    console.log(`✅ Перенесено ${promotions.length} акций`);

    // 8. Мигрируем клиентов
    console.log('👥 Мигрируем клиентов...');
    const customers = await sqliteQuery('SELECT * FROM customers');
    for (const customer of customers) {
      await pgQuery(
        'INSERT INTO customers (id, name, phone, email, address) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [customer.id, customer.name, customer.phone, customer.email, customer.address]
      );
    }
    console.log(`✅ Перенесено ${customers.length} клиентов`);

    // 9. Мигрируем заказы
    console.log('📦 Мигрируем заказы...');
    const orders = await sqliteQuery('SELECT * FROM orders');
    for (const order of orders) {
      await pgQuery(
        'INSERT INTO orders (id, order_number, customer_id, status, pricing_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [order.id, order.order_number, order.customer_id, order.status, order.pricing_json, order.created_at, order.updated_at]
      );
    }
    console.log(`✅ Перенесено ${orders.length} заказов`);

    // 10. Мигрируем элементы заказов
    console.log('📋 Мигрируем элементы заказов...');
    const orderItems = await sqliteQuery('SELECT * FROM order_items');
    for (const item of orderItems) {
      await pgQuery(
        'INSERT INTO order_items (id, order_id, product_id, title, price, quantity) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [item.id, item.order_id, item.product_id, item.title, item.price, item.quantity]
      );
    }
    console.log(`✅ Перенесено ${orderItems.length} элементов заказов`);

    // 11. Мигрируем заметки заказов
    console.log('📝 Мигрируем заметки заказов...');
    const orderNotes = await sqliteQuery('SELECT * FROM order_notes');
    for (const note of orderNotes) {
      await pgQuery(
        'INSERT INTO order_notes (id, order_id, text, type, timestamp) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [note.id, note.order_id, note.text, note.type, note.timestamp]
      );
    }
    console.log(`✅ Перенесено ${orderNotes.length} заметок заказов`);

    // 12. Мигрируем настройки рекламы
    console.log('📢 Мигрируем настройки рекламы...');
    const advertisingSettings = await sqliteQuery('SELECT * FROM advertising_settings');
    for (const setting of advertisingSettings) {
      await pgQuery(
        `INSERT INTO advertising_settings (id, platform, enabled, settings_json, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [
          setting.id, setting.platform, setting.enabled === 1, 
          setting.settings_json, setting.created_at, setting.updated_at
        ]
      );
    }
    console.log(`✅ Перенесено ${advertisingSettings.length} настроек рекламы`);

    // 13. Мигрируем настройки бота
    console.log('🤖 Мигрируем настройки бота...');
    const botSettings = await sqliteQuery('SELECT * FROM bot_settings');
    for (const setting of botSettings) {
      await pgQuery(
        `INSERT INTO bot_settings (id, bot_token, chat_id, enabled, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [
          setting.id, setting.bot_token, setting.chat_id, 
          setting.enabled === 1, setting.created_at, setting.updated_at
        ]
      );
    }
    console.log(`✅ Перенесено ${botSettings.length} настроек бота`);

    // 14. Мигрируем типы местности
    console.log('🏔️ Мигрируем типы местности...');
    const terrainTypes = await sqliteQuery('SELECT * FROM terrain_types');
    for (const terrain of terrainTypes) {
      await pgQuery(
        'INSERT INTO terrain_types (id, name, created_at) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [terrain.id, terrain.name, terrain.created_at]
      );
    }
    console.log(`✅ Перенесено ${terrainTypes.length} типов местности`);

    // 15. Мигрируем типы вездеходов
    console.log('🚗 Мигрируем типы вездеходов...');
    const vehicleTypes = await sqliteQuery('SELECT * FROM vehicle_types');
    for (const vehicle of vehicleTypes) {
      await pgQuery(
        'INSERT INTO vehicle_types (id, name, created_at) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [vehicle.id, vehicle.name, vehicle.created_at]
      );
    }
    console.log(`✅ Перенесено ${vehicleTypes.length} типов вездеходов`);

    console.log('🎉 Миграция данных завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при миграции данных:', error);
    throw error;
  } finally {
    sqliteDb.close();
    await pgPool.end();
  }
}

// Запускаем миграцию
migrateData().catch(console.error);
