/* eslint-disable */
const { db, run, get, all } = require('../db');
const {
  categoryStructure,
  initialProducts,
  initialBrands,
  initialPromotions
} = require('./initialData');

async function tableHasRows(tableName) {
  const row = await get(db, `SELECT COUNT(1) as cnt FROM ${tableName}`);
  return (row?.cnt || 0) > 0;
}

async function ensureCategory(name) {
  const row = await get(db, 'SELECT id FROM categories WHERE name = ?', [name]);
  if (row) return row.id;
  const res = await run(db, 'INSERT INTO categories (name) VALUES (?)', [name]);
  return res.lastID;
}

async function ensureSubcategory(categoryId, name) {
  const row = await get(db, 'SELECT id FROM subcategories WHERE category_id = ? AND name = ?', [categoryId, name]);
  if (row) return row.id;
  const res = await run(db, 'INSERT INTO subcategories (category_id, name) VALUES (?, ?)', [categoryId, name]);
  return res.lastID;
}

async function ensureBrand(name) {
  const row = await get(db, 'SELECT id FROM brands WHERE name = ?', [name]);
  if (row) return row.id;
  const res = await run(db, 'INSERT INTO brands (name) VALUES (?)', [name]);
  return res.lastID;
}

async function seedCategories() {
  for (const [categoryName, subcats] of Object.entries(categoryStructure)) {
    const categoryId = await ensureCategory(categoryName);
    for (const sub of subcats) {
      await ensureSubcategory(categoryId, sub);
    }
  }
}

async function seedBrands() {
  for (const brand of initialBrands) {
    await ensureBrand(brand);
  }
}

async function seedProducts() {
  // Не пересоздаем товары, если таблица не пустая
  if (await tableHasRows('products')) {
    console.log('Products already exist, skip products seeding');
    return;
  }
  for (const p of initialProducts) {
    const categoryId = p.category ? (await ensureCategory(p.category)) : null;
    const subcategoryId = p.subcategory && categoryId ? (await ensureSubcategory(categoryId, p.subcategory)) : null;
    const brandId = p.brand ? (await ensureBrand(p.brand)) : null;

    const specJson = p.specifications ? JSON.stringify(p.specifications) : null;
    const featJson = p.features ? JSON.stringify(p.features) : null;

    const res = await run(
      db,
      `INSERT INTO products (title, price, category_id, subcategory_id, brand_id, available, quantity, description, specifications_json, features_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.title,
        p.price,
        categoryId,
        subcategoryId,
        brandId,
        p.available ? 1 : 0,
        p.quantity ?? 0,
        p.description ?? null,
        specJson,
        featJson
      ]
    );

    const productId = res.lastID;
    // images
    if (Array.isArray(p.images)) {
      for (const img of p.images) {
        await run(
          db,
          `INSERT INTO product_images (product_id, image_data, is_main) VALUES (?, ?, ?)`,
          [productId, img.data, img.isMain ? 1 : 0]
        );
      }
    } else if (p.icon) {
      await run(db, `INSERT INTO product_images (product_id, image_data, is_main) VALUES (?, ?, 1)`, [productId, p.icon]);
    }
  }
}

async function seedPromotions() {
  // Не пересоздаем акции, если уже есть
  if (await tableHasRows('promotions')) {
    console.log('Promotions already exist, skip promotions seeding');
    return;
  }
  for (const promo of initialPromotions) {
    const categoryId = promo.category ? (await ensureCategory(promo.category)) : null;
    await run(
      db,
      `INSERT INTO promotions (title, description, discount, category_id, valid_until, active, featured, min_purchase)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        promo.title,
        promo.description ?? null,
        promo.discount,
        categoryId,
        promo.validUntil ?? null,
        promo.active ? 1 : 0,
        promo.featured ? 1 : 0,
        promo.minPurchase ?? null
      ]
    );
  }
}

async function main() {
  try {
    await seedCategories();
    await seedBrands();
    await seedProducts();
    await seedPromotions();
    console.log('Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

main();


