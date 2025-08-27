/* eslint-disable */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, run, get, all } = require('./db');
const fs = require('fs');
const multer = require('multer');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret-in-env';

app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// CORS (ограничим источники)
const allowedOrigins = new Set([
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3001', // через прокси changeOrigin
]);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '25mb' }));
// Статическая раздача загруженных файлов
const uploadsDir = path.join(__dirname, 'uploads');
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Настройка загрузки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = (file.mimetype || '').startsWith('image/');
    cb(ok ? null : new Error('Only image uploads are allowed'), ok);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// --- Auth helpers ---
async function ensureAdminTableAndDefaultUser() {
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );
  const row = await get(db, `SELECT COUNT(1) as cnt FROM admins`);
  if (!row || !row.cnt) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = await bcrypt.hash(password, 12);
    await run(db, `INSERT INTO admins (username, password_hash) VALUES (?, ?)`, [username, hash]);
    console.log('Created default admin user:', username);
  }
}

// Создаем таблицу для настроек бота
async function ensureBotSettingsTable() {
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS bot_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bot_token TEXT,
      chat_id TEXT,
      enabled INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );
  
  // Проверяем, есть ли уже настройки
  const row = await get(db, `SELECT COUNT(1) as cnt FROM bot_settings`);
  if (!row || !row.cnt) {
    // Вставляем дефолтные настройки (текущий токен из кода)
    await run(
      db,
      `INSERT INTO bot_settings (bot_token, chat_id, enabled) VALUES (?, ?, ?)`,
      ['8220911923:AAHOV3xvBPioSoBh53bPfceJBBkFYk1aqu0', '', 1]
    );
    console.log('Created default bot settings');
  }
}

function signAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

function parseAdminFromCookie(req, res, next) {
  const token = req.cookies && req.cookies.admin_token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = { id: decoded.id, username: decoded.username };
  } catch (_) {
    // ignore invalid/expired token
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.admin) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

function verifySameOrigin(req, res, next) {
  // Разрешаем системные и auth-эндпоинты без проверки
  if (req.path === '/api/health' || req.path === '/api/admin/login' || req.path === '/api/admin/logout' || req.path === '/api/admin/me') {
    return next();
  }
  const method = req.method.toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const origin = req.headers.origin || '';
    const referer = req.headers.referer || '';
    // Если заголовков нет (например, через дев-прокси) — пропускаем
    if (!origin && !referer) return next();
    const ok = Array.from(allowedOrigins).some((o) => origin === o || referer.startsWith(o));
    if (!ok) return res.status(403).json({ error: 'Forbidden origin' });
  }
  next();
}

app.use(parseAdminFromCookie);
app.use(verifySameOrigin);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// --- Auth routes ---
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
    const admin = await get(db, `SELECT id, username, password_hash FROM admins WHERE username=?`, [username]);
    if (!admin) return res.status(401).json({ error: 'Неверный логин или пароль' });
    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const token = signAdminToken({ id: admin.id, username: admin.username });
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 12 * 60 * 60 * 1000,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  res.clearCookie('admin_token', { path: '/' });
  res.json({ ok: true });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ id: req.admin.id, username: req.admin.username });
});

// Backup DB (download)
app.get('/api/_debug/backup', requireAdmin, (req, res) => {
  try {
    const dbPath = require('./db').DB_FILE;
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dst = path.join(backupsDir, `db-${stamp}.sqlite3`);
    fs.copyFileSync(dbPath, dst);
    res.json({ ok: true, file: `/api/_debug/download?f=${encodeURIComponent(path.basename(dst))}` });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/_debug/download', requireAdmin, (req, res) => {
  const file = req.query.f;
  if (!file) return res.status(400).send('Missing f');
  const full = path.join(backupsDir, file);
  if (!fs.existsSync(full)) return res.status(404).send('Not found');
  res.download(full);
});

// Upload image (admin only)
app.post('/api/upload/image', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

// Brands
app.get('/api/brands', async (req, res) => {
  try {
    const rows = await all(db, `SELECT id, name FROM brands ORDER BY name ASC`);
    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});
app.post('/api/brands', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    await ensureBrandByName(name);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});
app.delete('/api/brands/:name', requireAdmin, async (req, res) => {
  try {
    const { name } = req.params;
    await run(db, `DELETE FROM brands WHERE name=?`, [name]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

// Categories and subcategories as structure
app.get('/api/categories', async (req, res) => {
  try {
    const cats = await all(db, `SELECT id, name FROM categories ORDER BY name ASC`);
    const sub = await all(db, `SELECT id, category_id, name FROM subcategories ORDER BY name ASC`);
    const idToName = new Map(cats.map(c => [c.id, c.name]));
    const result = {};
    for (const c of cats) {
      result[c.name] = [];
    }
    for (const s of sub) {
      const catName = idToName.get(s.category_id);
      if (!catName) continue;
      result[catName].push(s.name);
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});
// Categories CRUD by name
app.post('/api/categories', requireAdmin, async (req, res) => {
  try {
    const { name, subcategories = [] } = req.body;
    const catId = await ensureCategoryByName(name);
    for (const s of subcategories) {
      await ensureSubcategoryByName(catId, s);
    }
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});
app.put('/api/categories/:name', requireAdmin, async (req, res) => {
  try {
    const oldName = req.params.name;
    const { newName } = req.body;
    await run(db, `UPDATE categories SET name=? WHERE name=?`, [newName, oldName]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to rename category' });
  }
});
app.delete('/api/categories/:name', requireAdmin, async (req, res) => {
  try {
    const name = req.params.name;
    await run(db, `DELETE FROM categories WHERE name=?`, [name]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});
app.put('/api/categories/:name/subcategories', requireAdmin, async (req, res) => {
  try {
    const name = req.params.name;
    const { subcategories = [] } = req.body;
    const cat = await get(db, `SELECT id FROM categories WHERE name=?`, [name]);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    await run(db, `DELETE FROM subcategories WHERE category_id=?`, [cat.id]);
    for (const s of subcategories) {
      await ensureSubcategoryByName(cat.id, s);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to set subcategories' });
  }
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const rows = await all(
      db,
      `SELECT p.*, 
              c.name AS category_name, 
              s.name AS subcategory_name, 
              b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories s ON p.subcategory_id = s.id
       LEFT JOIN brands b ON p.brand_id = b.id
       ORDER BY c.name ASC, s.name ASC, p.title ASC`
    );

    // Добавляем изображения
    const productIds = rows.map(r => r.id);
    console.log('🔍 Загружаем изображения для товаров:', productIds);
    
    let images = [];
    if (productIds.length > 0) {
      images = await all(
        db,
        `SELECT * FROM product_images WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
        productIds
      );
      console.log('📸 Найдено изображений:', images.length);
    }
    
    const productIdToImages = new Map();
    for (const img of images) {
      if (!productIdToImages.has(img.product_id)) productIdToImages.set(img.product_id, []);
      productIdToImages.get(img.product_id).push({ id: img.id, data: img.image_data, isMain: !!img.is_main });
      console.log(`🖼️ Товар ${img.product_id}: изображение ${img.id}, главное: ${img.is_main}, данные: ${img.image_data.substring(0, 50)}...`);
    }

    const result = rows.map(r => {
      const productImages = productIdToImages.get(r.id) || [];
      console.log(`📦 Товар ${r.id} "${r.title}": ${productImages.length} изображений`);
      if (productImages.length > 0) {
        console.log(`  🖼️ Изображения:`, productImages.map(img => ({ id: img.id, isMain: img.isMain, dataLength: img.data.length })));
      }
      
      return {
        id: r.id,
        title: r.title,
        price: r.price,
        category: r.category_name,
        subcategory: r.subcategory_name,
        brand: r.brand_name,
        available: !!r.available,
        quantity: r.quantity,
        description: r.description,
        specifications: r.specifications_json ? JSON.parse(r.specifications_json) : undefined,
        features: r.features_json ? JSON.parse(r.features_json) : undefined,
        images: productImages,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Helpers to ensure catalog entities
async function ensureCategoryByName(name) {
  if (!name) return null;
  const row = await get(db, `SELECT id FROM categories WHERE name = ?`, [name]);
  if (row) return row.id;
  const r = await run(db, `INSERT INTO categories (name) VALUES (?)`, [name]);
  return r.lastID;
}

async function ensureSubcategoryByName(categoryId, name) {
  if (!name || !categoryId) return null;
  const row = await get(db, `SELECT id FROM subcategories WHERE category_id = ? AND name = ?`, [categoryId, name]);
  if (row) return row.id;
  const r = await run(db, `INSERT INTO subcategories (category_id, name) VALUES (?, ?)`, [categoryId, name]);
  return r.lastID;
}

async function ensureBrandByName(name) {
  if (!name) return null;
  const row = await get(db, `SELECT id FROM brands WHERE name = ?`, [name]);
  if (row) return row.id;
  const r = await run(db, `INSERT INTO brands (name) VALUES (?)`, [name]);
  return r.lastID;
}

// Create product
app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const { title, price, category, subcategory, brand, available = true, quantity = 0, description = null, specifications, features, images } = req.body;

    const categoryId = await ensureCategoryByName(category);
    const subcategoryId = await ensureSubcategoryByName(categoryId, subcategory);
    const brandId = await ensureBrandByName(brand);

    const specJson = specifications ? JSON.stringify(specifications) : null;
    const featJson = features ? JSON.stringify(features) : null;

    const r = await run(
      db,
      `INSERT INTO products (title, price, category_id, subcategory_id, brand_id, available, quantity, description, specifications_json, features_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, price, categoryId, subcategoryId, brandId, available ? 1 : 0, quantity, description, specJson, featJson]
    );

    const productId = r.lastID;
    if (Array.isArray(images)) {
      for (const img of images) {
        await run(db, `INSERT INTO product_images (product_id, image_data, is_main) VALUES (?, ?, ?)`, [productId, img.data, img.isMain ? 1 : 0]);
      }
    }

    res.status(201).json({ id: productId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, price, category, subcategory, brand, available = true, quantity = 0, description = null, specifications, features, images } = req.body;

    const categoryId = await ensureCategoryByName(category);
    const subcategoryId = await ensureSubcategoryByName(categoryId, subcategory);
    const brandId = await ensureBrandByName(brand);

    const specJson = specifications ? JSON.stringify(specifications) : null;
    const featJson = features ? JSON.stringify(features) : null;

    await run(
      db,
      `UPDATE products SET title=?, price=?, category_id=?, subcategory_id=?, brand_id=?, available=?, quantity=?, description=?, specifications_json=?, features_json=?, updated_at = datetime('now') WHERE id=?`,
      [title, price, categoryId, subcategoryId, brandId, available ? 1 : 0, quantity, description, specJson, featJson, id]
    );

    // replace images
    if (Array.isArray(images)) {
      await run(db, `DELETE FROM product_images WHERE product_id = ?`, [id]);
      for (const img of images) {
        await run(db, `INSERT INTO product_images (product_id, image_data, is_main) VALUES (?, ?, ?)`, [id, img.data, img.isMain ? 1 : 0]);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await run(db, `DELETE FROM products WHERE id=?`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Promotions
app.get('/api/promotions', async (req, res) => {
  try {
    const rows = await all(
      db,
      `SELECT p.*, c.name AS category_name FROM promotions p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.featured DESC, p.id DESC`
    );
    const result = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      discount: r.discount,
      category: r.category_name,
      validUntil: r.valid_until,
      active: !!r.active,
      featured: !!r.featured,
      minPurchase: r.min_purchase
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// Promotions CRUD (минимум)
app.post('/api/promotions', requireAdmin, async (req, res) => {
  try {
    const { title, description, discount, category, validUntil, active = true, featured = false, minPurchase } = req.body;
    const catId = category ? (await get(db, `SELECT id FROM categories WHERE name = ?`, [category]))?.id : null;
    const r = await run(
      db,
      `INSERT INTO promotions (title, description, discount, category_id, valid_until, active, featured, min_purchase)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description ?? null, discount, catId ?? null, validUntil ?? null, active ? 1 : 0, featured ? 1 : 0, minPurchase ?? null]
    );
    res.status(201).json({ id: r.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create promotion' });
  }
});

app.put('/api/promotions/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, discount, category, validUntil, active, featured, minPurchase } = req.body;
    const catId = category ? (await get(db, `SELECT id FROM categories WHERE name = ?`, [category]))?.id : null;
    await run(
      db,
      `UPDATE promotions SET title=?, description=?, discount=?, category_id=?, valid_until=?, active=?, featured=?, min_purchase=? WHERE id=?`,
      [title, description ?? null, discount, catId ?? null, validUntil ?? null, active ? 1 : 0, featured ? 1 : 0, minPurchase ?? null, id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update promotion' });
  }
});

app.delete('/api/promotions/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await run(db, `DELETE FROM promotions WHERE id=?`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
});

// Orders
app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await all(db, `SELECT * FROM orders ORDER BY created_at DESC`);
    const orderIds = orders.map(o => o.id);
    let items = [];
    if (orderIds.length) {
      items = await all(db, `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`, orderIds);
    }
    const orderIdToItems = new Map();
    for (const it of items) {
      if (!orderIdToItems.has(it.order_id)) orderIdToItems.set(it.order_id, []);
      orderIdToItems.get(it.order_id).push({
        id: it.id,
        productId: it.product_id,
        title: it.title,
        price: it.price,
        quantity: it.quantity
      });
    }

    // notes
    let notes = [];
    if (orderIds.length) {
      notes = await all(db, `SELECT * FROM order_notes WHERE order_id IN (${orderIds.map(() => '?').join(',')}) ORDER BY timestamp ASC`, orderIds);
    }
    const orderIdToNotes = new Map();
    for (const n of notes) {
      if (!orderIdToNotes.has(n.order_id)) orderIdToNotes.set(n.order_id, []);
      orderIdToNotes.get(n.order_id).push({
        id: n.id,
        text: n.text,
        type: n.type,
        timestamp: n.timestamp
      });
    }

    const result = [];
    for (const o of orders) {
      const customer = o.customer_id ? await get(db, `SELECT * FROM customers WHERE id = ?`, [o.customer_id]) : null;
      result.push({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        pricing: JSON.parse(o.pricing_json),
        items: orderIdToItems.get(o.id) || [],
        customerInfo: customer || { name: '', phone: '', email: null, address: null },
        notes: orderIdToNotes.get(o.id) || [],
        createdAt: o.created_at,
        updatedAt: o.updated_at
      });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { orderForm, cartItems, priceCalculation, orderNumber } = req.body;

    // customer
    let customerId = null;
    if (orderForm) {
      const r = await run(
        db,
        `INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`,
        [orderForm.name, orderForm.phone, orderForm.email ?? null, orderForm.address ?? null]
      );
      customerId = r.lastID;
    }

    const id = String(orderNumber);
    await run(
      db,
      `INSERT INTO orders (id, order_number, customer_id, status, pricing_json) VALUES (?, ?, ?, 'new', ?)` ,
      [id, String(orderNumber), customerId, JSON.stringify(priceCalculation)]
    );

    if (Array.isArray(cartItems)) {
      for (const it of cartItems) {
        await run(
          db,
          `INSERT INTO order_items (order_id, product_id, title, price, quantity) VALUES (?, ?, ?, ?, ?)`,
          [id, it.id ?? null, it.title, it.price, it.quantity]
        );
      }
    }

    res.status(201).json({ ok: true, id, orderNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Orders: update status
app.patch('/api/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await run(db, `UPDATE orders SET status=?, updated_at = datetime('now') WHERE id=?`, [status, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Orders: add note
app.post('/api/orders/:id/notes', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, type = 'note' } = req.body;
    const r = await run(db, `INSERT INTO order_notes (order_id, text, type) VALUES (?, ?, ?)`, [id, text, type]);
    res.status(201).json({ id: r.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Orders: hard delete (used for cancelled orders cleanup)
app.delete('/api/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Удаляем связанные записи явно, чтобы не зависеть от PRAGMA foreign_keys
    await run(db, `DELETE FROM order_items WHERE order_id = ?`, [id]);
    await run(db, `DELETE FROM order_notes WHERE order_id = ?`, [id]);
    await run(db, `DELETE FROM orders WHERE id = ?`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Admin: normalize product IDs to be sequential starting from 1
app.post('/api/_admin/normalize/products', requireAdmin, async (req, res) => {
  try {
    await run(db, 'PRAGMA foreign_keys = OFF');
    await run(db, 'BEGIN TRANSACTION');

    // Create temp table with same schema as products
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

    // Update references in product_images
    const imgs = await all(db, `SELECT id, product_id FROM product_images`);
    for (const img of imgs) {
      const newId = idMap.get(img.product_id);
      if (newId) {
        await run(db, `UPDATE product_images SET product_id=? WHERE id=?`, [newId, img.id]);
      }
    }

    // Update references in order_items
    const orderItems = await all(db, `SELECT id, product_id FROM order_items WHERE product_id IS NOT NULL`);
    for (const it of orderItems) {
      const newId = idMap.get(it.product_id);
      if (newId) {
        await run(db, `UPDATE order_items SET product_id=? WHERE id=?`, [newId, it.id]);
      }
    }

    // Replace products table
    await run(db, `DROP TABLE products`);
    await run(db, `ALTER TABLE products_tmp RENAME TO products`);
    await run(db, 'COMMIT');
    await run(db, 'PRAGMA foreign_keys = ON');

    res.json({ ok: true, remapped: products.length });
  } catch (err) {
    try { await run(db, 'ROLLBACK'); } catch {}
    await run(db, 'PRAGMA foreign_keys = ON');
    console.error(err);
    res.status(500).json({ error: 'Failed to normalize product IDs' });
  }
});

// Advertising API endpoints
app.get('/api/admin/advertising', requireAdmin, async (req, res) => {
  try {
    const rows = await all(db, `SELECT platform, enabled, settings_json FROM advertising_settings ORDER BY platform ASC`);
    const result = {};
    
    for (const row of rows) {
      try {
        result[row.platform] = {
          enabled: Boolean(row.enabled),
          ...JSON.parse(row.settings_json)
        };
      } catch (e) {
        console.error(`Failed to parse settings for ${row.platform}:`, e);
        result[row.platform] = { enabled: Boolean(row.enabled) };
      }
    }
    
    res.json(result);
  } catch (err) {
    console.error('Failed to fetch advertising settings:', err);
    res.status(500).json({ error: 'Failed to fetch advertising settings' });
  }
});

app.post('/api/admin/advertising', requireAdmin, async (req, res) => {
  try {
    const { yandexDirect, googleAds, facebookPixel, vkPixel, telegramPixel, customScripts } = req.body;
    
    const platforms = [
      { name: 'yandexDirect', data: yandexDirect },
      { name: 'googleAds', data: googleAds },
      { name: 'facebookPixel', data: facebookPixel },
      { name: 'vkPixel', data: vkPixel },
      { name: 'telegramPixel', data: telegramPixel },
      { name: 'customScripts', data: customScripts }
    ];
    
    for (const platform of platforms) {
      if (platform.data) {
        const { enabled, ...settings } = platform.data;
        const settingsJson = JSON.stringify(settings);
        
        await run(
          db,
          `UPDATE advertising_settings SET enabled = ?, settings_json = ?, updated_at = datetime('now') WHERE platform = ?`,
          [enabled ? 1 : 0, settingsJson, platform.name]
        );
      }
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to save advertising settings:', err);
    res.status(500).json({ error: 'Failed to save advertising settings' });
  }
});

// Public endpoint for getting advertising scripts (for frontend)
app.get('/api/advertising/scripts', async (req, res) => {
  try {
    const rows = await all(db, `SELECT platform, enabled, settings_json FROM advertising_settings WHERE enabled = 1`);
    const scripts = {
      head: [],
      body: []
    };
    
    for (const row of rows) {
      try {
        const settings = JSON.parse(row.settings_json);
        
        switch (row.platform) {
          case 'yandexDirect':
            if (settings.counterId) {
              scripts.head.push(`
<!-- Yandex.Metrika counter -->
<script type="text/javascript" >
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(${settings.counterId}, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true
   });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/${settings.counterId}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->`);
            }
            if (settings.remarketingCode) {
              scripts.head.push(settings.remarketingCode);
            }
            break;
            
          case 'googleAds':
            if (settings.gtagCode) {
              scripts.head.push(`
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${settings.gtagCode}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${settings.gtagCode}');
</script>`);
            }
            if (settings.conversionId && settings.conversionLabel) {
              scripts.head.push(`
<!-- Google Ads Conversion Tracking -->
<script>
  gtag('event', 'conversion', {
    'send_to': '${settings.conversionId}/${settings.conversionLabel}'
  });
</script>`);
            }
            break;
            
          case 'facebookPixel':
            if (settings.pixelId) {
              scripts.head.push(`
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${settings.pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${settings.pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->`);
            }
            break;
            
          case 'vkPixel':
            if (settings.pixelId) {
              scripts.head.push(`
<!-- VK Pixel Code -->
<script>
!function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="https://vk.com/js/api/openapi.js?169";var e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(t,e)}();
window.vkAsyncInit=function(){VK.init({apiId:${settings.pixelId}});};
</script>`);
            }
            if (settings.conversionCode) {
              scripts.head.push(settings.conversionCode);
            }
            break;
            
          case 'telegramPixel':
            if (settings.botToken && settings.chatId) {
              scripts.head.push(`
<!-- Telegram Pixel Code -->
<script>
window.telegramPixel = {
  botToken: '${settings.botToken}',
  chatId: '${settings.chatId}'
};
</script>`);
            }
            break;
            
          case 'customScripts':
            if (settings.headScripts) {
              scripts.head.push(settings.headScripts);
            }
            if (settings.bodyScripts) {
              scripts.body.push(settings.bodyScripts);
            }
            break;
        }
      } catch (e) {
        console.error(`Failed to parse settings for ${row.platform}:`, e);
      }
    }
    
    res.json(scripts);
  } catch (err) {
    console.error('Failed to fetch advertising scripts:', err);
    res.status(500).json({ error: 'Failed to fetch advertising scripts' });
  }
});

// Test endpoint to check if server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Сервер работает!', 
    timestamp: new Date().toISOString(),

  });
});

// Bot management endpoints
app.get('/api/admin/bot', requireAdmin, async (req, res) => {
  try {
    const settings = await get(db, `SELECT bot_token, chat_id, enabled FROM bot_settings ORDER BY id DESC LIMIT 1`);
    if (!settings) {
      return res.json({ bot_token: '', chat_id: '', enabled: false });
    }
    res.json({
      bot_token: settings.bot_token || '',
      chat_id: settings.chat_id || '',
      enabled: Boolean(settings.enabled)
    });
  } catch (err) {
    console.error('Failed to fetch bot settings:', err);
    res.status(500).json({ error: 'Failed to fetch bot settings' });
  }
});

app.post('/api/admin/bot', requireAdmin, async (req, res) => {
  try {
    const { bot_token, enabled } = req.body;
    
    // Проверяем, есть ли уже настройки
    const existing = await get(db, `SELECT id, chat_id FROM bot_settings ORDER BY id DESC LIMIT 1`);
    
    if (existing) {
      // Обновляем существующие настройки, сохраняя текущий chat_id
      await run(
        db,
        `UPDATE bot_settings SET bot_token = ?, enabled = ?, updated_at = datetime('now') WHERE id = ?`,
        [bot_token, enabled ? 1 : 0, existing.id]
      );
    } else {
      // Создаем новые настройки с пустым chat_id
      await run(
        db,
        `INSERT INTO bot_settings (bot_token, chat_id, enabled) VALUES (?, ?, ?)`,
        [bot_token, '', enabled ? 1 : 0]
      );
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to save bot settings:', err);
    res.status(500).json({ error: 'Failed to save bot settings' });
  }
});

// Test bot connection
app.post('/api/admin/bot/test', requireAdmin, async (req, res) => {
  try {
    const { bot_token } = req.body;
    
    if (!bot_token) {
      return res.status(400).json({ error: 'Bot token обязателен для тестирования' });
    }
    
    // Получаем настройки бота из базы данных
    const botSettings = await get(db, `SELECT chat_id FROM bot_settings ORDER BY id DESC LIMIT 1`);
    
    if (!botSettings || !botSettings.chat_id) {
      return res.status(400).json({ error: 'Chat ID не настроен. Сначала настройте бота через админку.' });
    }
    
    const testMessage = `🧪 <b>Тестовое сообщение</b>\n\nЭто тестовое сообщение для проверки настроек бота.\n\n📅 Время: ${new Date().toLocaleString('ru-RU')}\n✅ Бот работает корректно!`;
    
    const response = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: botSettings.chat_id,
        text: testMessage,
        parse_mode: 'HTML'
      }),
    });
    
    const data = await response.json();
    
    if (data.ok) {
      res.json({ success: true, message: 'Тестовое сообщение успешно отправлено!' });
    } else {
      res.json({ success: false, error: data.description || 'Ошибка отправки сообщения' });
    }
  } catch (err) {
    console.error('Failed to test bot:', err);
    res.status(500).json({ error: 'Failed to test bot connection' });
  }
});

// Debug: list registered routes (admin only)
app.get('/api/_debug/routes', requireAdmin, (req, res) => {
  try {
    const routes = [];
    app._router.stack.forEach((m) => {
      if (m.route && m.route.path) {
        routes.push({ path: m.route.path, methods: m.route.methods });
      }
      if (m.name === 'router' && m.handle && m.handle.stack) {
        m.handle.stack.forEach((h) => {
          if (h.route && h.route.path) {
            routes.push({ path: h.route.path, methods: h.route.methods });
          }
        });
      }
    });
    res.json(routes);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});





// Test import endpoint - импортируем только одну строку для отладки






Promise.all([
  ensureAdminTableAndDefaultUser(),
  ensureBotSettingsTable()
])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error('Failed to initialize tables', e);
    process.exit(1);
  });

