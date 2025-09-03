/* eslint-disable */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { run, get, all, waitForConnection } = require('./db');
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

// Database status check
app.get('/api/db-status', async (req, res) => {
  try {
    await get('SELECT 1');
    res.json({ 
      status: 'connected',
      message: 'Database is connected and working'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'disconnected',
      message: 'Database is not available',
      error: error.message,
      instructions: [
        '1. Go to Render Dashboard',
        '2. Create a new PostgreSQL database',
        '3. Copy the connection string',
        '4. Add it as DATABASE_URL environment variable',
        '5. Redeploy the service'
      ]
    });
  }
});

// Reset database (for development only)
app.post('/api/reset-db', async (req, res) => {
  try {
    console.log('Resetting database...');
    
    // Удаляем все таблицы
    await run('DROP SCHEMA public CASCADE');
    await run('CREATE SCHEMA public');
    await run('GRANT ALL ON SCHEMA public TO postgres');
    await run('GRANT ALL ON SCHEMA public TO public');
    
    res.json({ 
      success: true,
      message: 'Database reset successfully. Restart the server to apply migrations.'
    });
  } catch (error) {
    console.error('Database reset failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// Create admin user
app.post('/api/admin/create', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Username and password are required' 
      });
    }
    
    // Проверяем, есть ли уже админ
    const existingAdmin = await get('SELECT * FROM admins WHERE username = $1', [username]);
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        error: 'Admin already exists' 
      });
    }
    
    // Хешируем пароль
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Создаем админа
    const result = await run(
      'INSERT INTO admins (username, password_hash, created_at) VALUES ($1, $2, $3)',
      [username, passwordHash, new Date().toISOString()]
    );
    
    res.json({ 
      success: true,
      message: 'Admin created successfully',
      adminId: result.lastID
    });
    
  } catch (error) {
    console.error('Admin creation failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// Upload images from uploads folder
app.post('/api/upload-images', async (req, res) => {
  try {
    console.log('Starting image upload from uploads folder...');
    const fs = require('fs');
    const path = require('path');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    
    let results = [];
    
    for (const file of files) {
      if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        try {
          const filePath = path.join(uploadsDir, file);
          const imageData = fs.readFileSync(filePath);
          const base64Data = imageData.toString('base64');
          
          // Находим товар по имени файла или создаем новый
          const productId = 1; // Временно используем ID 1
          
          await run(
            'INSERT INTO product_images (product_id, image_data, is_main) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [productId, base64Data, true]
          );
          
          results.push(`✅ Загружено изображение: ${file}`);
        } catch (error) {
          results.push(`❌ Ошибка при загрузке ${file}: ${error.message}`);
        }
      }
    }
    
    res.json({ 
      success: true,
      message: 'Image upload completed!',
      results: results
    });
    
  } catch (error) {
    console.error('Image upload failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// Upload data to PostgreSQL
app.post('/api/upload-data', async (req, res) => {
  try {
    console.log('Starting data upload to PostgreSQL...');
    const data = req.body;
    
    let results = [];
    
    // Загружаем категории
    if (data.categories && data.categories.length > 0) {
      for (const category of data.categories) {
        await run(
          'INSERT INTO categories (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [category.id, category.name]
        );
      }
      results.push(`✅ Загружено ${data.categories.length} категорий`);
    }
    
    // Загружаем подкатегории
    if (data.subcategories && data.subcategories.length > 0) {
      for (const subcategory of data.subcategories) {
        await run(
          'INSERT INTO subcategories (id, category_id, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
          [subcategory.id, subcategory.category_id, subcategory.name]
        );
      }
      results.push(`✅ Загружено ${data.subcategories.length} подкатегорий`);
    }
    
    // Загружаем бренды
    if (data.brands && data.brands.length > 0) {
      for (const brand of data.brands) {
        await run(
          'INSERT INTO brands (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [brand.id, brand.name]
        );
      }
      results.push(`✅ Загружено ${data.brands.length} брендов`);
    }
    
    // Загружаем товары
    if (data.products && data.products.length > 0) {
      for (const product of data.products) {
        await run(
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
      results.push(`✅ Загружено ${data.products.length} товаров`);
    }
    
    // Загружаем изображения товаров
    if (data.productImages && data.productImages.length > 0) {
      for (const image of data.productImages) {
        await run(
          'INSERT INTO product_images (id, product_id, image_data, is_main) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [image.id, image.product_id, image.image_data, image.is_main === 1]
        );
      }
      results.push(`✅ Загружено ${data.productImages.length} изображений`);
    }
    
    // Загружаем настройки бота
    if (data.botSettings && data.botSettings.length > 0) {
      for (const setting of data.botSettings) {
        await run(
          `INSERT INTO bot_settings (id, bot_token, chat_id, enabled, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
          [
            setting.id, setting.bot_token, setting.chat_id, 
            setting.enabled === 1, setting.created_at, setting.updated_at
          ]
        );
      }
      results.push(`✅ Загружено ${data.botSettings.length} настроек бота`);
    }
    
    res.json({ 
      success: true,
      message: 'Data upload completed successfully!',
      results: results
    });
    
  } catch (error) {
    console.error('Data upload failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint works', timestamp: new Date().toISOString() });
});

// Check tables endpoint
app.get('/api/check-tables', async (req, res) => {
  try {
    const tables = ['promotions', 'terrain_types', 'vehicle_types', 'product_images', 'products', 'categories', 'brands'];
    const results = {};
    
    for (const table of tables) {
      try {
        const count = await get(`SELECT COUNT(*) as count FROM ${table}`);
        results[table] = { exists: true, count: count.count };
      } catch (error) {
        results[table] = { exists: false, error: error.message };
      }
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple bootstrap test
app.get('/api/bootstrap-test', (req, res) => {
  console.log('Bootstrap test endpoint called');
  res.json({ 
    message: 'Bootstrap test works', 
    timestamp: new Date().toISOString(),
    data: {
      categories: [],
      brands: [],
      products: [],
      stats: { totalProducts: 0 }
    }
  });
});

// Handle OPTIONS requests for bootstrap
app.options('/api/bootstrap', (req, res) => {
  console.log('OPTIONS request for bootstrap');
  res.set({
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true'
  });
  res.sendStatus(200);
});

// Bootstrap endpoint for admin panel
app.get('/api/bootstrap', async (req, res) => {
  console.log('=== BOOTSTRAP ENDPOINT CALLED ===');
  console.log('Request headers:', req.headers);
  console.log('Request origin:', req.headers.origin);
  
  try {
    // Устанавливаем заголовки для предотвращения кэширования
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true'
    });
    
    console.log('Headers set, starting data loading...');
    
    // Простой bootstrap с минимальными данными
    const bootstrapData = {
      categories: [],
      brands: [],
      products: [],
      promotions: [],
      orders: [],
      customers: [],
      stats: {
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalPromotions: 0
      }
    };
    
    console.log('Initial bootstrap data structure created');
    
    // Пытаемся загрузить товары
    try {
      console.log('Attempting to load products...');
      const products = await all('SELECT * FROM products ORDER BY created_at DESC LIMIT 100');
      bootstrapData.products = products;
      bootstrapData.stats.totalProducts = products.length;
      console.log(`✅ Loaded ${products.length} products`);
    } catch (e) {
      console.log('❌ Products table error:', e.message);
    }
    
    // Пытаемся загрузить категории
    try {
      console.log('Attempting to load categories...');
      const categories = await all('SELECT * FROM categories ORDER BY name');
      bootstrapData.categories = categories;
      console.log(`✅ Loaded ${categories.length} categories`);
    } catch (e) {
      console.log('❌ Categories table error:', e.message);
    }
    
    // Пытаемся загрузить бренды
    try {
      console.log('Attempting to load brands...');
      const brands = await all('SELECT * FROM brands ORDER BY name');
      bootstrapData.brands = brands;
      console.log(`✅ Loaded ${brands.length} brands`);
    } catch (e) {
      console.log('❌ Brands table error:', e.message);
    }
    
    console.log('=== BOOTSTRAP DATA PREPARED SUCCESSFULLY ===');
    console.log('Sending response...');
    
    res.json(bootstrapData);
    
    console.log('=== BOOTSTRAP RESPONSE SENT ===');
  } catch (error) {
    console.error('=== BOOTSTRAP ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to load bootstrap data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
      if (productIds.length > 0) {
        const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
        images = await all(`
          SELECT product_id, image_data, is_main 
          FROM product_images 
          WHERE product_id IN (${placeholders})
        `, productIds);
      }
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

// --- Promotions routes ---
app.get('/api/promotions', async (req, res) => {
  try {
    console.log('=== PROMOTIONS ENDPOINT CALLED ===');
    console.log('Attempting to query promotions table...');
    
    const promotions = await all('SELECT * FROM promotions ORDER BY id DESC');
    console.log(`✅ Successfully fetched ${promotions.length} promotions`);
    console.log('Promotions data:', promotions);
    
    res.json(promotions);
  } catch (error) {
    console.error('=== PROMOTIONS ENDPOINT ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to fetch promotions', 
      details: error.message,
      code: error.code
    });
  }
});

// --- Terrain types routes ---
app.get('/api/terrain-types', async (req, res) => {
  try {
    console.log('Terrain types endpoint called');
    const terrainTypes = await all('SELECT * FROM terrain_types ORDER BY name');
    console.log(`Returning ${terrainTypes.length} terrain types`);
    res.json(terrainTypes);
  } catch (error) {
    console.error('Terrain types endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch terrain types' });
  }
});

// --- Vehicle types routes ---
app.get('/api/vehicle-types', async (req, res) => {
  try {
    console.log('Vehicle types endpoint called');
    const vehicleTypes = await all('SELECT * FROM vehicle_types ORDER BY name');
    console.log(`Returning ${vehicleTypes.length} vehicle types`);
    res.json(vehicleTypes);
  } catch (error) {
    console.error('Vehicle types endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle types' });
  }
});

// --- Advertising scripts routes ---
app.get('/api/advertising/scripts', async (req, res) => {
  try {
    console.log('Advertising scripts endpoint called');
    // Возвращаем пустой объект для скриптов рекламы
    const scripts = {
      head: [],
      body: []
    };
    console.log('Returning advertising scripts');
    res.json(scripts);
  } catch (error) {
    console.error('Advertising scripts endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch advertising scripts' });
  }
});

// --- Product management routes ---
app.post('/api/products', async (req, res) => {
  try {
    console.log('Creating new product:', req.body);
    const { title, description, price, category, subcategory, brand, terrain_type, vehicle_type, images } = req.body;
    
    // Получаем ID категории, подкатегории и бренда
    let categoryId = null;
    let subcategoryId = null;
    let brandId = null;
    
    if (category) {
      const catResult = await get('SELECT id FROM categories WHERE name = $1', [category]);
      if (catResult) categoryId = catResult.id;
    }
    
    if (subcategory && categoryId) {
      const subResult = await get('SELECT id FROM subcategories WHERE name = $1 AND category_id = $2', [subcategory, categoryId]);
      if (subResult) subcategoryId = subResult.id;
    }
    
    if (brand) {
      const brandResult = await get('SELECT id FROM brands WHERE name = $1', [brand]);
      if (brandResult) brandId = brandResult.id;
    }
    
    const result = await run(`
      INSERT INTO products (title, description, price, category_id, subcategory_id, brand_id, terrain_type, vehicle_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [title, description, price, categoryId, subcategoryId, brandId, terrain_type, vehicle_type]);
    
    const product = result.rows[0];
    
    // Добавляем изображения если есть
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await run(`
          INSERT INTO product_images (product_id, image_data, is_main)
          VALUES ($1, $2, $3)
        `, [product.id, image.data, i === 0]);
      }
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, subcategory, brand, terrain_type, vehicle_type } = req.body;
    
    // Получаем ID категории, подкатегории и бренда
    let categoryId = null;
    let subcategoryId = null;
    let brandId = null;
    
    if (category) {
      const catResult = await get('SELECT id FROM categories WHERE name = $1', [category]);
      if (catResult) categoryId = catResult.id;
    }
    
    if (subcategory && categoryId) {
      const subResult = await get('SELECT id FROM subcategories WHERE name = $1 AND category_id = $2', [subcategory, categoryId]);
      if (subResult) subcategoryId = subResult.id;
    }
    
    if (brand) {
      const brandResult = await get('SELECT id FROM brands WHERE name = $1', [brand]);
      if (brandResult) brandId = brandResult.id;
    }
    
    const result = await run(`
      UPDATE products 
      SET title = $1, description = $2, price = $3, category_id = $4, subcategory_id = $5, brand_id = $6, terrain_type = $7, vehicle_type = $8
      WHERE id = $9
      RETURNING *
    `, [title, description, price, categoryId, subcategoryId, brandId, terrain_type, vehicle_type, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Удаляем изображения товара
    await run('DELETE FROM product_images WHERE product_id = $1', [id]);
    
    // Удаляем товар
    const result = await run('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// --- Category management routes ---
app.post('/api/categories', requireAdmin, async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    
    // Проверяем, существует ли категория
    const existing = await get('SELECT * FROM categories WHERE name = $1', [name]);
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    // Создаем категорию
    await run('INSERT INTO categories (name) VALUES ($1)', [name]);
    
    // Добавляем подкатегории если есть
    if (subcategories && Array.isArray(subcategories)) {
      for (const subcategory of subcategories) {
        await run('INSERT INTO subcategories (name, category_name) VALUES ($1, $2)', [subcategory, name]);
      }
    }
    
    res.json({ message: 'Category created successfully' });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:name', requireAdmin, async (req, res) => {
  try {
    const { name } = req.params;
    const { newName } = req.body;
    
    if (newName && newName !== name) {
      // Переименовываем категорию
      await run('UPDATE categories SET name = $1 WHERE name = $2', [newName, name]);
      await run('UPDATE subcategories SET category_name = $1 WHERE category_name = $2', [newName, name]);
      await run('UPDATE products SET category = $1 WHERE category = $2', [newName, name]);
    }
    
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.put('/api/categories/:name/subcategories', requireAdmin, async (req, res) => {
  try {
    const { name } = req.params;
    const { subcategories } = req.body;
    
    // Удаляем старые подкатегории
    await run('DELETE FROM subcategories WHERE category_name = $1', [name]);
    
    // Добавляем новые подкатегории
    if (subcategories && Array.isArray(subcategories)) {
      for (const subcategory of subcategories) {
        await run('INSERT INTO subcategories (name, category_name) VALUES ($1, $2)', [subcategory, name]);
      }
    }
    
    res.json({ message: 'Subcategories updated successfully' });
  } catch (error) {
    console.error('Error updating subcategories:', error);
    res.status(500).json({ error: 'Failed to update subcategories' });
  }
});

// --- Brand management routes ---
app.post('/api/brands', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Проверяем, существует ли бренд
    const existing = await get('SELECT * FROM brands WHERE name = $1', [name]);
    if (existing) {
      return res.status(400).json({ error: 'Brand already exists' });
    }
    
    // Создаем бренд
    const result = await run('INSERT INTO brands (name) VALUES ($1) RETURNING *', [name]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

app.put('/api/brands/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const result = await run('UPDATE brands SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

app.delete('/api/brands/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await run('DELETE FROM brands WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

// --- Promotion management routes ---
app.post('/api/promotions', requireAdmin, async (req, res) => {
  try {
    const { title, description, discount_percent, category, start_date, end_date } = req.body;
    
    const result = await run(`
      INSERT INTO promotions (title, description, discount_percent, category, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description, discount_percent, category, start_date, end_date]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ error: 'Failed to create promotion' });
  }
});

app.put('/api/promotions/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, discount_percent, category, start_date, end_date } = req.body;
    
    const result = await run(`
      UPDATE promotions 
      SET title = $1, description = $2, discount_percent = $3, category = $4, start_date = $5, end_date = $6
      WHERE id = $7
      RETURNING *
    `, [title, description, discount_percent, category, start_date, end_date, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ error: 'Failed to update promotion' });
  }
});

app.delete('/api/promotions/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await run('DELETE FROM promotions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
});

// --- Load sample images endpoint ---
app.post('/api/load-sample-images', async (req, res) => {
  try {
    console.log('Loading sample images...');
    
    // Загружаем несколько тестовых изображений для товаров
    const sampleImages = [
      {
        product_id: 1,
        image_data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
        is_main: true
      },
      {
        product_id: 2,
        image_data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
        is_main: true
      }
    ];
    
    let results = [];
    for (const image of sampleImages) {
      try {
        await run(
          'INSERT INTO product_images (product_id, image_data, is_main) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [image.product_id, image.image_data, image.is_main]
        );
        results.push(`✅ Загружено изображение для товара ${image.product_id}`);
      } catch (error) {
        results.push(`❌ Ошибка загрузки изображения для товара ${image.product_id}: ${error.message}`);
      }
    }
    
    res.json({ success: true, message: 'Sample images loaded', results: results });
  } catch (error) {
    console.error('Load sample images error:', error);
    res.status(500).json({ error: 'Failed to load sample images', details: error.message });
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

// Функция для применения миграций
async function applyMigrations() {
  try {
    console.log('Применяю миграции для PostgreSQL...');
    
    // Список миграций в порядке применения
    const migrations = [
      '001_init_pg.sql',
      '002_advertising_pg.sql', 
      '003_terrain_vehicle_types_pg.sql',
      '004_bot_settings_pg.sql'
    ];
    
    // Создаем таблицу для отслеживания примененных миграций
    await run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    
    for (const migrationFile of migrations) {
      // Проверяем, была ли уже применена эта миграция
      const result = await get(
        'SELECT id FROM migrations WHERE filename = $1',
        [migrationFile]
      );
      
      if (result) {
        console.log(`Миграция ${migrationFile} уже применена, пропускаем...`);
        continue;
      }
      
      console.log(`Применяю миграцию: ${migrationFile}`);
      
      // Читаем файл миграции
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Выполняем весь SQL файл целиком в транзакции
      await run('BEGIN');
      
      try {
        console.log('Выполняю SQL миграцию...');
        await run(migrationSQL);
        
        // Отмечаем миграцию как примененную
        await run(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [migrationFile]
        );
        
        await run('COMMIT');
        console.log(`Миграция ${migrationFile} успешно применена!`);
        
      } catch (error) {
        await run('ROLLBACK');
        throw error;
      }
    }
    
    console.log('Все миграции успешно применены!');
    
  } catch (error) {
    console.error('Ошибка при применении миграций:', error);
    throw error;
  }
}

// Инициализация
async function startServer() {
  try {
    // Ждем подключения к базе данных
    console.log('Waiting for database connection...');
    await waitForConnection();
    
    // Применяем миграции
    await applyMigrations();
    
    // Создаем админа по умолчанию
    await ensureAdminTableAndDefaultUser();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    
    // Если база данных недоступна, запускаем сервер в режиме ожидания
    if (error.message.includes('Failed to connect to database')) {
      console.log('\n=== DATABASE SETUP REQUIRED ===');
      console.log('PostgreSQL database is not available.');
      console.log('Please follow these steps:');
      console.log('1. Go to Render Dashboard');
      console.log('2. Create a new PostgreSQL database');
      console.log('3. Copy the connection string');
      console.log('4. Add it as DATABASE_URL environment variable');
      console.log('5. Redeploy the service');
      console.log('===============================\n');
      
      // Запускаем сервер с ограниченным функционалом
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (Database unavailable)`);
        console.log(`Environment: ${NODE_ENV}`);
      });
    } else {
      process.exit(1);
    }
  }
}

startServer();
