/* eslint-disable */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { run, get, all } = require('./db');
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

// CORS настройки
app.use(
  cors({
    origin: true, // Разрешаем все домены для отладки
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Логирование всех запросов для отладки
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

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
  // Проверяем, есть ли админы в базе
  const row = await get(`SELECT COUNT(1) as cnt FROM admins`);
  if (!row || !row.cnt) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin31827'; // Используем ваш пароль
    const hash = await bcrypt.hash(password, 12);
    await run(`INSERT INTO admins (username, password_hash) VALUES ($1, $2)`, [username, hash]);
    console.log('Created default admin user:', username);
  }
}

function signAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

function parseAdminFromCookie(req, res, next) {
  const token = req.cookies && req.cookies.admin_token;
  console.log('parseAdminFromCookie - token present:', !!token);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = { id: decoded.id, username: decoded.username };
    console.log('parseAdminFromCookie - admin set:', req.admin.username);
  } catch (err) {
    console.log('parseAdminFromCookie - token verification failed:', err.message);
    // ignore invalid/expired token
  }
  next();
}

function requireAdmin(req, res, next) {
  console.log('requireAdmin - admin present:', !!req.admin);
  if (!req.admin) {
    console.log('requireAdmin - unauthorized, no admin');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function verifySameOrigin(req, res, next) {
  // Временно отключаем проверку origin для отладки
  return next();
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
    const admin = await get(`SELECT id, username, password_hash FROM admins WHERE username=$1`, [username]);
    if (!admin) return res.status(401).json({ error: 'Неверный логин или пароль' });
    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const token = signAdminToken({ id: admin.id, username: admin.username });
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
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

// Тестовый эндпоинт для отладки
app.get('/api/admin/debug', (req, res) => {
  res.json({
    cookies: req.cookies,
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      cookie: req.headers.cookie
    },
    admin: req.admin || null,
    jwtSecret: JWT_SECRET ? 'set' : 'not set'
  });
});

// Эндпоинт для сброса пароля админа (только для разработки)
app.post('/api/admin/reset-password', async (req, res) => {
  try {
    const { username, newPassword } = req.body || {};
    if (!username || !newPassword) {
      return res.status(400).json({ error: 'Missing username or password' });
    }
    
    const hash = await bcrypt.hash(newPassword, 12);
    await run(`UPDATE admins SET password_hash = $1 WHERE username = $2`, [hash, username]);
    
    const updated = await get(`SELECT id, username FROM admins WHERE username = $1`, [username]);
    if (updated) {
      res.json({ success: true, message: 'Password updated successfully' });
    } else {
      res.status(404).json({ error: 'Admin not found' });
    }
  } catch (err) {
    console.error('Password reset failed:', err);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Простые эндпоинты для тестирования
app.get('/api/brands', async (req, res) => {
  try {
    const rows = await all(`SELECT id, name FROM brands ORDER BY name ASC`);
    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const cats = await all(`SELECT id, name FROM categories ORDER BY name ASC`);
    const sub = await all(`SELECT id, category_id, name FROM subcategories ORDER BY name ASC`);
    const idToName = new Map(cats.map(c => [c.id, c.name]));
    const result = cats.map(c => ({
      name: c.name,
      subcategories: sub.filter(s => s.category_id === c.id).map(s => s.name)
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const rows = await all(`
      SELECT p.*, c.name as category_name, b.name as brand_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN brands b ON p.brand_id = b.id 
      ORDER BY p.id DESC
    `);
    
    let images = [];
    if (rows.length > 0) {
      const productIds = rows.map(p => p.id);
      images = await all(`
        SELECT product_id, image_data, is_main 
        FROM product_images 
        WHERE product_id = ANY($1)
      `, [productIds]);
    }
    
    const imageMap = new Map();
    images.forEach(img => {
      if (!imageMap.has(img.product_id)) imageMap.set(img.product_id, []);
      imageMap.get(img.product_id).push({
        data: img.image_data,
        isMain: img.is_main
      });
    });
    
    const result = rows.map(p => ({
      ...p,
      images: imageMap.get(p.id) || []
    }));
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await all(`SELECT * FROM orders ORDER BY created_at DESC`);
    const orderIds = orders.map(o => o.id);
    
    let items = [];
    if (orderIds.length) {
      items = await all(`SELECT * FROM order_items WHERE order_id = ANY($1)`, [orderIds]);
    }
    
    let notes = [];
    if (orderIds.length) {
      notes = await all(`SELECT * FROM order_notes WHERE order_id = ANY($1) ORDER BY timestamp ASC`, [orderIds]);
    }
    
    const itemMap = new Map();
    items.forEach(item => {
      if (!itemMap.has(item.order_id)) itemMap.set(item.order_id, []);
      itemMap.get(item.order_id).push(item);
    });
    
    const noteMap = new Map();
    notes.forEach(note => {
      if (!noteMap.has(note.order_id)) noteMap.set(note.order_id, []);
      noteMap.get(note.order_id).push(note);
    });
    
    const result = [];
    for (const o of orders) {
      const customer = o.customer_id ? await get(`SELECT * FROM customers WHERE id = $1`, [o.customer_id]) : null;
      result.push({
        ...o,
        customer,
        items: itemMap.get(o.id) || [],
        notes: noteMap.get(o.id) || []
      });
    }
    
    res.json(result);
  } catch (err) {
    console.error('Ошибка при загрузке заказов с сервера:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Инициализация
async function startServer() {
  try {
    await ensureAdminTableAndDefaultUser();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
