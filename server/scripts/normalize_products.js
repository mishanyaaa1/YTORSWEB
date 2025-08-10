/* eslint-disable */
const { db, run, all } = require('../db');

async function main() {
  try {
    console.log('Normalizing product IDs...');
    await run(db, 'PRAGMA foreign_keys = OFF');
    await run(db, 'BEGIN TRANSACTION');

    await run(
      db,
      `CREATE TABLE IF NOT EXISTS products_tmp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price INTEGER NOT NULL,
        category_id INTEGER,
        subcategory_id INTEGER,
        brand_id INTEGER,
        available INTEGER NOT NULL DEFAULT 1,
        quantity INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        specifications_json TEXT,
        features_json TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL,
        FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
      )`
    );

    const products = await all(db, `SELECT * FROM products ORDER BY id ASC`);
    const idMap = new Map();
    for (const p of products) {
      const r = await run(
        db,
        `INSERT INTO products_tmp (title, price, category_id, subcategory_id, brand_id, available, quantity, description, specifications_json, features_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.title,
          p.price,
          p.category_id,
          p.subcategory_id,
          p.brand_id,
          p.available,
          p.quantity,
          p.description,
          p.specifications_json,
          p.features_json,
          p.created_at,
          p.updated_at,
        ]
      );
      idMap.set(p.id, r.lastID);
    }

    const imgs = await all(db, `SELECT id, product_id FROM product_images`);
    for (const img of imgs) {
      const newId = idMap.get(img.product_id);
      if (newId) {
        await run(db, `UPDATE product_images SET product_id=? WHERE id=?`, [newId, img.id]);
      }
    }

    const orderItems = await all(db, `SELECT id, product_id FROM order_items WHERE product_id IS NOT NULL`);
    for (const it of orderItems) {
      const newId = idMap.get(it.product_id);
      if (newId) {
        await run(db, `UPDATE order_items SET product_id=? WHERE id=?`, [newId, it.id]);
      }
    }

    await run(db, `DROP TABLE products`);
    await run(db, `ALTER TABLE products_tmp RENAME TO products`);
    await run(db, 'COMMIT');
    await run(db, 'PRAGMA foreign_keys = ON');
    console.log(`Done. Remapped ${products.length} products.`);
    process.exit(0);
  } catch (err) {
    try { await run(db, 'ROLLBACK'); } catch {}
    await run(db, 'PRAGMA foreign_keys = ON');
    console.error('Normalize failed:', err);
    process.exit(1);
  }
}

main();


