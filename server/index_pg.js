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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Добавлен PATCH
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
  })
);

// Логирование всех запросов для отладки
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Убираем проблемный OPTIONS обработчик - CORS middleware должен справляться сам

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
  console.log('🔍 parseAdminFromCookie - URL:', req.url);
  console.log('🔍 parseAdminFromCookie - token present:', !!token);
  console.log('🔍 parseAdminFromCookie - all cookies:', Object.keys(req.cookies || {}));
  console.log('🔍 parseAdminFromCookie - origin:', req.headers.origin);
  
  if (!token) {
    console.log('❌ parseAdminFromCookie - no token found');
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = { id: decoded.id, username: decoded.username };
    console.log('✅ parseAdminFromCookie - admin set:', req.admin.username);
  } catch (err) {
    console.log('❌ parseAdminFromCookie - token verification failed:', err.message);
    // ignore invalid/expired token
  }
  next();
}

function requireAdmin(req, res, next) {
  console.log('🔐 requireAdmin - URL:', req.url);
  console.log('🔐 requireAdmin - admin present:', !!req.admin);
  console.log('🔐 requireAdmin - cookies received:', Object.keys(req.cookies || {}));
  
  if (!req.admin) {
    console.log('❌ requireAdmin - unauthorized, no admin found');
    console.log('❌ requireAdmin - this usually means the user needs to login again');
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Пожалуйста, войдите в систему заново. Возможно, истекла сессия.',
      action: 'login_required'
    });
  }
  
  console.log('✅ requireAdmin - access granted for:', req.admin.username);
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
    const tables = ['promotions', 'terrain_types', 'vehicle_types', 'product_images', 'products', 'categories', 'brands', 'vehicles'];
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

// Удален дублирующий обработчик OPTIONS для bootstrap - теперь используется общий обработчик

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
app.get('/api/admin/debug', async (req, res) => {
  const debugInfo = {
    cookies: req.cookies,
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      cookie: req.headers.cookie
    },
    admin: req.admin || null,
    jwtSecret: JWT_SECRET ? 'set' : 'not set',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set'
    }
  };

  try {
    console.log('🔍 Debug endpoint called');
    
    // Тест подключения к базе данных
    console.log('🔌 Testing database connection...');
    const { pool } = require('./db');
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Проверяем таблицы в базе данных
    console.log('📋 Checking tables...');
    const tables = await all(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📋 Found tables:', tables.map(t => t.table_name));
    
    // Проверяем количество записей в основных таблицах
    const counts = {};
    const tablesToCheck = ['brands', 'categories', 'products', 'admins'];
    
    for (const table of tablesToCheck) {
      try {
        console.log(`📊 Checking count for table: ${table}`);
        const result = await get(`SELECT COUNT(*) as count FROM ${table}`);
        counts[table] = result?.count || 0;
        console.log(`📊 Table ${table}: ${counts[table]} records`);
      } catch (error) {
        console.error(`❌ Error checking table ${table}:`, error.message);
        counts[table] = `Error: ${error.message}`;
      }
    }
    
    // Проверяем миграции
    let migrations = [];
    try {
      console.log('🔄 Checking migrations...');
      migrations = await all(`SELECT filename, applied_at FROM migrations ORDER BY applied_at DESC`);
      console.log('🔄 Applied migrations:', migrations.length);
    } catch (error) {
      console.error('❌ Error checking migrations:', error.message);
      migrations = [{ error: error.message }];
    }
    
    client.release();
    
    debugInfo.database = {
      status: 'connected',
      tables: tables.map(t => t.table_name),
      recordCounts: counts,
      migrations: migrations
    };
    
    console.log('✅ Debug info collected successfully');
    
  } catch (error) {
    console.error('❌ Database debug error:', error);
    console.error('❌ Error stack:', error.stack);
    
    debugInfo.database = {
      status: 'error',
      error: error.message,
      stack: error.stack
    };
  }
  
  res.json(debugInfo);
});

// Эндпоинт для исправления sequences (автоинкремента)
app.post('/api/admin/fix-sequences', requireAdmin, async (req, res) => {
  try {
    console.log('🔧 Fixing PostgreSQL sequences...');
    
    // Список таблиц для исправления
    const tables = ['brands', 'categories', 'products', 'admins', 'promotions', 'customers', 'vehicles'];
    const results = [];
    
    for (const table of tables) {
      try {
        console.log(`🔧 Fixing sequence for table: ${table}`);
        
        // Получаем максимальный ID
        const maxResult = await get(`SELECT MAX(id) as max_id FROM ${table}`);
        const maxId = maxResult?.max_id || 0;
        
        // Устанавливаем sequence на следующее значение
        const sequenceName = `${table}_id_seq`;
        await run(`SELECT setval('${sequenceName}', $1, true)`, [maxId + 1]);
        
        results.push({ table, maxId, newSequenceValue: maxId + 1 });
        console.log(`✅ Fixed ${table}: max_id=${maxId}, sequence set to ${maxId + 1}`);
        
      } catch (error) {
        console.error(`❌ Error fixing ${table}:`, error.message);
        results.push({ table, error: error.message });
      }
    }
    
    console.log('✅ Sequences fixed successfully');
    res.json({ success: true, results });
    
  } catch (error) {
    console.error('❌ Error fixing sequences:', error);
    res.status(500).json({ error: 'Failed to fix sequences', details: error.message });
  }
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

// Upload image (admin only)
app.post('/api/upload/image', requireAdmin, upload.single('image'), (req, res) => {
  try {
    console.log('🔥 Uploading image:', req.file?.filename);
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const url = `/uploads/${req.file.filename}`;
    console.log('✅ Image uploaded:', url);
    res.status(201).json({ url });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
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
      id: p.id,
      title: p.title,
      price: p.price,
      description: p.description,
      available: p.available,
      quantity: p.quantity,
      specifications_json: p.specifications_json,
      features_json: p.features_json,
      created_at: p.created_at,
      updated_at: p.updated_at,
      // Нормализуем поля для фронтенда
      category: p.category_name,
      subcategory: null, // Добавим позже если нужно
      brand: p.brand_name,
      // Оставляем ID для внутреннего использования
      category_id: p.category_id,
      subcategory_id: p.subcategory_id,
      brand_id: p.brand_id,
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
    const terrainTypes = await all('SELECT name FROM terrain_types ORDER BY name');
    console.log(`Returning ${terrainTypes.length} terrain types`);
    res.json(terrainTypes.map(t => t.name));
  } catch (error) {
    console.error('Terrain types endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch terrain types' });
  }
});

app.post('/api/terrain-types', requireAdmin, async (req, res) => {
  try {
    console.log('🔥 Creating terrain type:', req.body);
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Terrain type name is required' });
    }
    
    const trimmedName = name.trim();
    await run(`INSERT INTO terrain_types (name) VALUES ($1)`, [trimmedName]);
    console.log('✅ Terrain type created:', trimmedName);
    res.status(201).json({ ok: true, name: trimmedName });
  } catch (error) {
    console.error('❌ Error creating terrain type:', error);
    if (error.message && error.message.includes('duplicate key value')) {
      res.status(409).json({ error: 'Terrain type already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create terrain type', details: error.message });
    }
  }
});

app.put('/api/terrain-types/:name', requireAdmin, async (req, res) => {
  try {
    const oldName = req.params.name;
    const { name: newName } = req.body;
    console.log('✏️ Updating terrain type:', oldName, 'to', newName);
    
    if (!newName || !newName.trim()) {
      return res.status(400).json({ error: 'New terrain type name is required' });
    }
    
    const trimmedName = newName.trim();
    const result = await run(`UPDATE terrain_types SET name = $1 WHERE name = $2`, [trimmedName, oldName]);
    
    if (result.changes === 0) {
      console.log('❌ Terrain type not found:', oldName);
      return res.status(404).json({ error: 'Terrain type not found' });
    }
    
    console.log('✅ Terrain type updated successfully:', oldName, 'to', trimmedName);
    res.json({ ok: true, name: trimmedName });
  } catch (error) {
    console.error('❌ Error updating terrain type:', error);
    if (error.message && error.message.includes('duplicate key value')) {
      res.status(409).json({ error: 'Terrain type with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update terrain type', details: error.message });
    }
  }
});

app.delete('/api/terrain-types/:name', requireAdmin, async (req, res) => {
  try {
    const name = req.params.name;
    console.log('🗑️ Deleting terrain type:', name);
    const result = await run(`DELETE FROM terrain_types WHERE name = $1`, [name]);
    
    if (result.changes === 0) {
      console.log('❌ Terrain type not found:', name);
      return res.status(404).json({ error: 'Terrain type not found' });
    }
    
    console.log('✅ Terrain type deleted successfully:', name);
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error deleting terrain type:', error);
    res.status(500).json({ error: 'Failed to delete terrain type', details: error.message });
  }
});

// --- Vehicle types routes ---
app.get('/api/vehicle-types', async (req, res) => {
  try {
    console.log('Vehicle types endpoint called');
    const vehicleTypes = await all('SELECT name FROM vehicle_types ORDER BY name');
    console.log(`Returning ${vehicleTypes.length} vehicle types`);
    res.json(vehicleTypes.map(t => t.name));
  } catch (error) {
    console.error('Vehicle types endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle types' });
  }
});

app.post('/api/vehicle-types', requireAdmin, async (req, res) => {
  try {
    console.log('🔥 Creating vehicle type:', req.body);
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Vehicle type name is required' });
    }
    
    const trimmedName = name.trim();
    await run(`INSERT INTO vehicle_types (name) VALUES ($1)`, [trimmedName]);
    console.log('✅ Vehicle type created:', trimmedName);
    res.status(201).json({ ok: true, name: trimmedName });
  } catch (error) {
    console.error('❌ Error creating vehicle type:', error);
    if (error.message && error.message.includes('duplicate key value')) {
      res.status(409).json({ error: 'Vehicle type already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create vehicle type', details: error.message });
    }
  }
});

app.put('/api/vehicle-types/:name', requireAdmin, async (req, res) => {
  try {
    const oldName = req.params.name;
    const { name: newName } = req.body;
    console.log('✏️ Updating vehicle type:', oldName, 'to', newName);
    
    if (!newName || !newName.trim()) {
      return res.status(400).json({ error: 'New vehicle type name is required' });
    }
    
    const trimmedName = newName.trim();
    const result = await run(`UPDATE vehicle_types SET name = $1 WHERE name = $2`, [trimmedName, oldName]);
    
    if (result.changes === 0) {
      console.log('❌ Vehicle type not found:', oldName);
      return res.status(404).json({ error: 'Vehicle type not found' });
    }
    
    console.log('✅ Vehicle type updated successfully:', oldName, 'to', trimmedName);
    res.json({ ok: true, name: trimmedName });
  } catch (error) {
    console.error('❌ Error updating vehicle type:', error);
    if (error.message && error.message.includes('duplicate key value')) {
      res.status(409).json({ error: 'Vehicle type with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update vehicle type', details: error.message });
    }
  }
});

app.delete('/api/vehicle-types/:name', requireAdmin, async (req, res) => {
  try {
    const name = req.params.name;
    console.log('🗑️ Deleting vehicle type:', name);
    const result = await run(`DELETE FROM vehicle_types WHERE name = $1`, [name]);
    
    if (result.changes === 0) {
      console.log('❌ Vehicle type not found:', name);
      return res.status(404).json({ error: 'Vehicle type not found' });
    }
    
    console.log('✅ Vehicle type deleted successfully:', name);
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error deleting vehicle type:', error);
    res.status(500).json({ error: 'Failed to delete vehicle type', details: error.message });
  }
});

// --- Vehicles routes ---
app.get('/api/vehicles', async (req, res) => {
  try {
    console.log('Vehicles endpoint called');
    const rows = await all('SELECT * FROM vehicles ORDER BY id');
    console.log('Vehicles found:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Vehicles endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    console.log('Creating new vehicle:', req.body);
    const { name, description, terrain_type, vehicle_type, specifications } = req.body;
    
    const result = await run(`
      INSERT INTO vehicles (name, description, terrain_type, vehicle_type, specifications)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, description, terrain_type, vehicle_type, specifications]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

app.put('/api/vehicles/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, terrain_type, vehicle_type, specifications } = req.body;
    
    const result = await run(`
      UPDATE vehicles 
      SET name = $1, description = $2, terrain_type = $3, vehicle_type = $4, specifications = $5
      WHERE id = $6
      RETURNING *
    `, [name, description, terrain_type, vehicle_type, specifications, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

app.delete('/api/vehicles/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await run('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// --- Advertising routes ---
app.get('/api/admin/advertising', requireAdmin, async (req, res) => {
  try {
    console.log('🔥 Getting advertising settings');
    const rows = await all(`SELECT platform, enabled, settings_json FROM advertising_settings ORDER BY platform ASC`);
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
    
    console.log('✅ Advertising settings fetched');
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to fetch advertising settings:', error);
    res.status(500).json({ error: 'Failed to fetch advertising settings', details: error.message });
  }
});

app.post('/api/admin/advertising', requireAdmin, async (req, res) => {
  try {
    console.log('🔥 Saving advertising settings:', req.body);
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
          `UPDATE advertising_settings SET enabled = $1, settings_json = $2, updated_at = NOW() WHERE platform = $3`,
          [enabled ? true : false, settingsJson, platform.name]
        );
        console.log(`✅ Updated ${platform.name} settings`);
      }
    }
    
    console.log('✅ Advertising settings saved successfully');
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Failed to save advertising settings:', error);
    res.status(500).json({ error: 'Failed to save advertising settings', details: error.message });
  }
});

// Public endpoint for getting advertising scripts (for frontend)
app.get('/api/advertising/scripts', async (req, res) => {
  try {
    console.log('Advertising scripts endpoint called');
    const rows = await all(`SELECT platform, enabled, settings_json FROM advertising_settings WHERE enabled = true`);
    const scripts = {
      head: [],
      body: []
    };
    
    for (const row of rows) {
      try {
        const settings = JSON.parse(row.settings_json);
        // Здесь можно добавить логику генерации скриптов на основе настроек
        console.log(`Processing scripts for ${row.platform}`);
      } catch (e) {
        console.error(`Failed to parse settings for ${row.platform}:`, e);
      }
    }
    
    console.log('Returning advertising scripts');
    res.json(scripts);
  } catch (error) {
    console.error('Advertising scripts endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch advertising scripts' });
  }
});

// Helper functions для обеспечения существования записей
async function ensureCategoryByName(name) {
  if (!name) return null;
  const row = await get(`SELECT id FROM categories WHERE name = $1`, [name]);
  if (row) return row.id;
  const r = await run(`INSERT INTO categories (name) VALUES ($1) RETURNING id`, [name]);
  return r.rows[0]?.id || r.lastID;
}

async function ensureSubcategoryByName(categoryId, name) {
  if (!name || !categoryId) return null;
  const row = await get(`SELECT id FROM subcategories WHERE category_id = $1 AND name = $2`, [categoryId, name]);
  if (row) return row.id;
  const r = await run(`INSERT INTO subcategories (category_id, name) VALUES ($1, $2) RETURNING id`, [categoryId, name]);
  return r.rows[0]?.id || r.lastID;
}

async function ensureBrandByName(name) {
  console.log('🔍 ensureBrandByName called with:', name);
  if (!name) {
    console.log('❌ ensureBrandByName: name is empty');
    return null;
  }
  
  try {
    console.log('🔍 Checking if brand exists:', name);
    const row = await get(`SELECT id FROM brands WHERE name = $1`, [name]);
    if (row) {
      console.log('✅ Brand exists with ID:', row.id);
      return row.id;
    }
    
    console.log('➕ Creating new brand:', name);
    const r = await run(`INSERT INTO brands (name) VALUES ($1) RETURNING id`, [name]);
    console.log('📊 Insert result:', r);
    
    const brandId = r.rows?.[0]?.id || r.lastID;
    console.log('✅ New brand created with ID:', brandId);
    return brandId;
  } catch (error) {
    console.error('❌ Error in ensureBrandByName:', error);
    console.error('❌ Error details:', error.message);
    throw error;
  }
}

// --- Product management routes ---
app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    console.log('🔥 Creating new product:', req.body);
    const { title, price, category, subcategory, brand, available = true, quantity = 0, description = null, specifications, features, images } = req.body;

    const categoryId = await ensureCategoryByName(category);
    const subcategoryId = await ensureSubcategoryByName(categoryId, subcategory);
    const brandId = await ensureBrandByName(brand);

    const specJson = specifications ? JSON.stringify(specifications) : null;
    const featJson = features ? JSON.stringify(features) : null;

    const r = await run(
      `INSERT INTO products (title, price, category_id, subcategory_id, brand_id, available, quantity, description, specifications_json, features_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, price, categoryId, subcategoryId, brandId, available ? 1 : 0, quantity, description, specJson, featJson]
    );

    const productId = r.rows[0].id;
    console.log('✅ Product created with ID:', productId);
    
    if (Array.isArray(images)) {
      console.log('📸 Adding images:', images.length);
      for (const img of images) {
        await run(`INSERT INTO product_images (product_id, image_data, is_main) VALUES ($1, $2, $3)`, [productId, img.data, img.isMain ? 1 : 0]);
      }
    }

    res.status(201).json({ id: productId });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    console.log('🔄 Updating product:', id, req.body);
    const { title, price, category, subcategory, brand, available = true, quantity = 0, description = null, specifications, features, images } = req.body;

    const categoryId = await ensureCategoryByName(category);
    const subcategoryId = await ensureSubcategoryByName(categoryId, subcategory);
    const brandId = await ensureBrandByName(brand);

    const specJson = specifications ? JSON.stringify(specifications) : null;
    const featJson = features ? JSON.stringify(features) : null;

    await run(
      `UPDATE products SET title=$1, price=$2, category_id=$3, subcategory_id=$4, brand_id=$5, available=$6, quantity=$7, description=$8, specifications_json=$9, features_json=$10, updated_at=NOW() WHERE id=$11`,
      [title, price, categoryId, subcategoryId, brandId, available ? 1 : 0, quantity, description, specJson, featJson, id]
    );

    // replace images
    if (Array.isArray(images)) {
      console.log('📸 Updating images for product:', id);
      await run(`DELETE FROM product_images WHERE product_id = $1`, [id]);
      for (const img of images) {
        await run(`INSERT INTO product_images (product_id, image_data, is_main) VALUES ($1, $2, $3)`, [id, img.data, img.isMain ? 1 : 0]);
      }
    }

    console.log('✅ Product updated successfully:', id);
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    console.log('🗑️ Deleting product:', id);
    
    // Удаляем изображения товара
    await run('DELETE FROM product_images WHERE product_id = $1', [id]);
    
    // Удаляем товар
    const result = await run('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      console.log('❌ Product not found:', id);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('✅ Product deleted successfully:', id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// --- Category management routes ---
app.post('/api/categories', requireAdmin, async (req, res) => {
  try {
    console.log('🔥 Creating category:', req.body);
    const { name, subcategories = [] } = req.body;
    const catId = await ensureCategoryByName(name);
    for (const s of subcategories) {
      await ensureSubcategoryByName(catId, s);
    }
    console.log('✅ Category created successfully:', name);
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('❌ Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category', details: error.message });
  }
});

app.put('/api/categories/:name', requireAdmin, async (req, res) => {
  try {
    const oldName = req.params.name;
    const { newName } = req.body;
    console.log('🔄 Renaming category:', oldName, '→', newName);
    await run(`UPDATE categories SET name=$1 WHERE name=$2`, [newName, oldName]);
    console.log('✅ Category renamed successfully');
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error renaming category:', error);
    res.status(500).json({ error: 'Failed to rename category', details: error.message });
  }
});

app.put('/api/categories/:name/subcategories', requireAdmin, async (req, res) => {
  try {
    const name = req.params.name;
    const { subcategories = [] } = req.body;
    console.log('🔄 Updating subcategories for:', name, subcategories);
    
    const cat = await get(`SELECT id FROM categories WHERE name=$1`, [name]);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    
    await run(`DELETE FROM subcategories WHERE category_id=$1`, [cat.id]);
    for (const s of subcategories) {
      await ensureSubcategoryByName(cat.id, s);
    }
    
    console.log('✅ Subcategories updated successfully');
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error updating subcategories:', error);
    res.status(500).json({ error: 'Failed to set subcategories', details: error.message });
  }
});

app.delete('/api/categories/:name', requireAdmin, async (req, res) => {
  try {
    const name = req.params.name;
    console.log('🗑️ Deleting category:', name);
    await run(`DELETE FROM categories WHERE name=$1`, [name]);
    console.log('✅ Category deleted successfully');
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category', details: error.message });
  }
});

// --- Brand management routes ---
app.post('/api/brands', requireAdmin, async (req, res) => {
  try {
    console.log('🔥 Creating brand:', req.body);
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      console.log('❌ Invalid brand name:', name);
      return res.status(400).json({ error: 'Brand name is required' });
    }
    
    const trimmedName = name.trim();
    console.log('🔍 Checking if brand exists:', trimmedName);
    
    // Проверяем, существует ли бренд
    const existing = await get('SELECT * FROM brands WHERE name = $1', [trimmedName]);
    if (existing) {
      console.log('⚠️ Brand already exists:', trimmedName);
      return res.status(400).json({ error: 'Brand already exists' });
    }
    
    // Создаем бренд
    console.log('➕ Creating new brand:', trimmedName);
    const result = await run('INSERT INTO brands (name) VALUES ($1) RETURNING *', [trimmedName]);
    console.log('📊 Insert result:', result);
    
    const newBrand = result.rows[0];
    console.log('✅ New brand created:', newBrand);
    
    res.json(newBrand);
  } catch (error) {
    console.error('❌ Error creating brand:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create brand', details: error.message });
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
    console.log('🗑️ Deleting brand with ID:', id);
    
    // Конвертируем ID в число для PostgreSQL
    const brandId = parseInt(id, 10);
    if (isNaN(brandId)) {
      console.log('❌ Invalid brand ID:', id);
      return res.status(400).json({ error: 'Invalid brand ID' });
    }
    
    const result = await run('DELETE FROM brands WHERE id = $1 RETURNING *', [brandId]);
    console.log('🗑️ Delete result:', result);
    
    if (result.rows.length === 0) {
      console.log('❌ Brand not found with ID:', brandId);
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    console.log('✅ Brand deleted successfully:', result.rows[0]);
    res.json({ message: 'Brand deleted successfully', deletedBrand: result.rows[0] });
  } catch (error) {
    console.error('❌ Error deleting brand:', error);
    res.status(500).json({ error: 'Failed to delete brand', details: error.message });
  }
});

// Delete brand by name (for backward compatibility) - using different route to avoid conflicts
app.delete('/api/brands/by-name/:name', requireAdmin, async (req, res) => {
  try {
    const { name } = req.params;
    console.log('🗑️ Deleting brand by name:', name);
    
    // Проверяем если это число (ID), то перенаправляем на удаление по ID
    const maybeId = parseInt(name, 10);
    if (!isNaN(maybeId)) {
      // Это ID, используем удаление по ID
      const result = await run('DELETE FROM brands WHERE id = $1 RETURNING *', [maybeId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Brand not found' });
      }
      console.log('✅ Brand deleted by ID:', maybeId);
      return res.json({ ok: true });
    }
    
    // Это имя, удаляем по имени
    const result = await run('DELETE FROM brands WHERE name = $1 RETURNING *', [name]);
    if (result.rows.length === 0) {
      console.log('❌ Brand not found by name:', name);
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    console.log('✅ Brand deleted by name:', name);
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error deleting brand by name:', error);
    res.status(500).json({ error: 'Failed to delete brand', details: error.message });
  }
});

// --- Promotion management routes ---
app.post('/api/promotions', requireAdmin, async (req, res) => {
  try {
    console.log('🔥 Creating promotion:', req.body);
    const { title, description, discount, category, validUntil, active = true, featured = false, minPurchase } = req.body;
    const catId = category ? (await get(`SELECT id FROM categories WHERE name = $1`, [category]))?.id : null;
    
    const r = await run(
      `INSERT INTO promotions (title, description, discount, category_id, valid_until, active, featured, min_purchase)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description ?? null, discount, catId ?? null, validUntil ?? null, active ? true : false, featured ? true : false, minPurchase ?? null]
    );
    
    console.log('✅ Promotion created:', r.rows[0]);
    res.status(201).json({ id: r.rows[0].id });
  } catch (error) {
    console.error('❌ Error creating promotion:', error);
    res.status(500).json({ error: 'Failed to create promotion', details: error.message });
  }
});

app.put('/api/promotions/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    console.log('🔄 Updating promotion:', id, req.body);
    const { title, description, discount, category, validUntil, active, featured, minPurchase } = req.body;
    const catId = category ? (await get(`SELECT id FROM categories WHERE name = $1`, [category]))?.id : null;
    
    await run(
      `UPDATE promotions SET title=$1, description=$2, discount=$3, category_id=$4, valid_until=$5, active=$6, featured=$7, min_purchase=$8 WHERE id=$9`,
      [title, description ?? null, discount, catId ?? null, validUntil ?? null, active ? true : false, featured ? true : false, minPurchase ?? null, id]
    );
    
    console.log('✅ Promotion updated successfully:', id);
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error updating promotion:', error);
    res.status(500).json({ error: 'Failed to update promotion', details: error.message });
  }
});

app.delete('/api/promotions/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    console.log('🗑️ Deleting promotion:', id);
    await run(`DELETE FROM promotions WHERE id=$1`, [id]);
    console.log('✅ Promotion deleted successfully:', id);
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error deleting promotion:', error);
    res.status(500).json({ error: 'Failed to delete promotion', details: error.message });
  }
});

// --- Bot settings management routes ---
app.get('/api/admin/bot', requireAdmin, async (req, res) => {
  try {
    console.log('🤖 Getting bot settings');
    const settings = await get(`SELECT bot_token, chat_id, enabled FROM bot_settings ORDER BY id DESC LIMIT 1`);
    if (!settings) {
      console.log('🤖 No bot settings found, returning defaults');
      return res.json({ bot_token: '', chat_id: '', enabled: false });
    }
    console.log('🤖 Bot settings found:', { enabled: settings.enabled, hasToken: !!settings.bot_token, hasChatId: !!settings.chat_id });
    res.json({
      bot_token: settings.bot_token || '',
      chat_id: settings.chat_id || '',
      enabled: Boolean(settings.enabled)
    });
  } catch (error) {
    console.error('❌ Failed to fetch bot settings:', error);
    res.status(500).json({ error: 'Failed to fetch bot settings', details: error.message });
  }
});

app.post('/api/admin/bot', requireAdmin, async (req, res) => {
  try {
    console.log('🤖 Saving bot settings:', req.body);
    const { bot_token, enabled } = req.body;
    
    // Проверяем, есть ли уже настройки
    const existing = await get(`SELECT id, chat_id FROM bot_settings ORDER BY id DESC LIMIT 1`);
    
    if (existing) {
      // Обновляем существующие настройки, сохраняя текущий chat_id
      await run(
        `UPDATE bot_settings SET bot_token = $1, enabled = $2, updated_at = NOW() WHERE id = $3`,
        [bot_token, enabled ? true : false, existing.id]
      );
      console.log('🤖 Updated existing bot settings');
    } else {
      // Создаем новые настройки с пустым chat_id
      await run(
        `INSERT INTO bot_settings (bot_token, chat_id, enabled) VALUES ($1, $2, $3)`,
        [bot_token, '', enabled ? true : false]
      );
      console.log('🤖 Created new bot settings');
    }
    
    console.log('✅ Bot settings saved successfully');
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Failed to save bot settings:', error);
    res.status(500).json({ error: 'Failed to save bot settings', details: error.message });
  }
});

// Test bot connection
app.post('/api/admin/bot/test', requireAdmin, async (req, res) => {
  try {
    console.log('🤖 Testing bot connection');
    const { bot_token } = req.body;
    
    if (!bot_token) {
      return res.status(400).json({ error: 'Bot token обязателен для тестирования' });
    }
    
    // Тестируем бота через метод getMe (не требует chat_id)
    const response = await fetch(`https://api.telegram.org/bot${bot_token}/getMe`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.log('❌ Bot test failed:', result);
      return res.status(400).json({ 
        success: false,
        error: `Ошибка Telegram API: ${result.description || 'Неизвестная ошибка'}`,
        details: result
      });
    }

    console.log('✅ Bot test successful:', result);
    res.json({ 
      success: true, 
      message: `Бот подключен успешно! Имя бота: ${result.result.first_name} (@${result.result.username})`,
      bot_info: result.result
    });
  } catch (error) {
    console.error('❌ Bot test error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка при тестировании бота',
      details: error.message
    });
  }
});

// --- Full data migration endpoint ---
app.post('/api/migrate-all-data', async (req, res) => {
  try {
    console.log('Starting full data migration...');
    
    // Читаем экспортированные данные
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, 'exported-data.json');
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: 'Exported data file not found' });
    }
    
    const exportedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log('Loaded exported data:', Object.keys(exportedData));
    
    let results = {
      categories: 0,
      subcategories: 0,
      brands: 0,
      products: 0,
      productImages: 0,
      promotions: 0,
      customers: 0,
      orders: 0,
      orderItems: 0,
      orderNotes: 0
    };
    
    // Мигрируем категории
    if (exportedData.categories) {
      for (const category of exportedData.categories) {
        try {
          await run('INSERT INTO categories (id, name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = $2', [category.id, category.name]);
          results.categories++;
        } catch (error) {
          console.error('Error migrating category:', category, error.message);
        }
      }
    }
    
    // Мигрируем подкатегории
    if (exportedData.subcategories) {
      for (const subcategory of exportedData.subcategories) {
        try {
          await run('INSERT INTO subcategories (id, category_id, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = $3', [subcategory.id, subcategory.category_id, subcategory.name]);
          results.subcategories++;
        } catch (error) {
          console.error('Error migrating subcategory:', subcategory, error.message);
        }
      }
    }
    
    // Мигрируем бренды
    if (exportedData.brands) {
      for (const brand of exportedData.brands) {
        try {
          await run('INSERT INTO brands (id, name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = $2', [brand.id, brand.name]);
          results.brands++;
        } catch (error) {
          console.error('Error migrating brand:', brand, error.message);
        }
      }
    }
    
    // Мигрируем товары
    if (exportedData.products) {
      for (const product of exportedData.products) {
        try {
          await run(`
            INSERT INTO products (id, title, price, category_id, subcategory_id, brand_id, available, quantity, description, specifications_json, features_json, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO UPDATE SET 
              title = $2, price = $3, category_id = $4, subcategory_id = $5, brand_id = $6, 
              available = $7, quantity = $8, description = $9, specifications_json = $10, 
              features_json = $11, updated_at = $13
          `, [
            product.id, product.title, product.price, product.category_id, product.subcategory_id, 
            product.brand_id, product.available, product.quantity, product.description, 
            product.specifications_json, product.features_json, product.created_at, product.updated_at
          ]);
          results.products++;
        } catch (error) {
          console.error('Error migrating product:', product, error.message);
        }
      }
    }
    
    // Мигрируем изображения товаров
    if (exportedData.productImages) {
      for (const image of exportedData.productImages) {
        try {
          await run(`
            INSERT INTO product_images (id, product_id, image_data, is_main)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE SET image_data = $3, is_main = $4
          `, [image.id, image.product_id, image.image_data, image.is_main]);
          results.productImages++;
        } catch (error) {
          console.error('Error migrating product image:', image, error.message);
        }
      }
    }
    
    // Мигрируем акции
    if (exportedData.promotions) {
      for (const promotion of exportedData.promotions) {
        try {
          await run(`
            INSERT INTO promotions (id, title, description, discount_percent, category, start_date, end_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET 
              title = $2, description = $3, discount_percent = $4, category = $5, 
              start_date = $6, end_date = $7
          `, [promotion.id, promotion.title, promotion.description, promotion.discount_percent, promotion.category, promotion.start_date, promotion.end_date]);
          results.promotions++;
        } catch (error) {
          console.error('Error migrating promotion:', promotion, error.message);
        }
      }
    }
    
    // Мигрируем клиентов
    if (exportedData.customers) {
      for (const customer of exportedData.customers) {
        try {
          await run(`
            INSERT INTO customers (id, name, phone, email, address, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET 
              name = $2, phone = $3, email = $4, address = $5
          `, [customer.id, customer.name, customer.phone, customer.email, customer.address, customer.created_at]);
          results.customers++;
        } catch (error) {
          console.error('Error migrating customer:', customer, error.message);
        }
      }
    }
    
    // Мигрируем заказы
    if (exportedData.orders) {
      for (const order of exportedData.orders) {
        try {
          await run(`
            INSERT INTO orders (id, customer_id, status, total_amount, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET 
              status = $3, total_amount = $4, updated_at = $6
          `, [order.id, order.customer_id, order.status, order.total_amount, order.created_at, order.updated_at]);
          results.orders++;
        } catch (error) {
          console.error('Error migrating order:', order, error.message);
        }
      }
    }
    
    // Мигрируем элементы заказов
    if (exportedData.orderItems) {
      for (const item of exportedData.orderItems) {
        try {
          await run(`
            INSERT INTO order_items (id, order_id, product_id, quantity, price)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET 
              quantity = $4, price = $5
          `, [item.id, item.order_id, item.product_id, item.quantity, item.price]);
          results.orderItems++;
        } catch (error) {
          console.error('Error migrating order item:', item, error.message);
        }
      }
    }
    
    // Мигрируем заметки заказов
    if (exportedData.orderNotes) {
      for (const note of exportedData.orderNotes) {
        try {
          await run(`
            INSERT INTO order_notes (id, order_id, note, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE SET note = $3
          `, [note.id, note.order_id, note.note, note.created_at]);
          results.orderNotes++;
        } catch (error) {
          console.error('Error migrating order note:', note, error.message);
        }
      }
    }
    
    console.log('Migration completed:', results);
    res.json({ message: 'Full data migration completed', results });
    
  } catch (error) {
    console.error('Error in full data migration:', error);
    res.status(500).json({ error: 'Failed to migrate data', details: error.message });
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
    console.log('🛒 Loading orders from database...');
    const orders = await all(`SELECT * FROM orders ORDER BY created_at DESC`);
    console.log(`📦 Found ${orders.length} orders`);
    const orderIds = orders.map(o => o.id);
    
    let items = [];
    if (orderIds.length) {
      items = await all(`SELECT * FROM order_items WHERE order_id = ANY($1)`, [orderIds]);
      console.log(`📋 Found ${items.length} order items`);
    }
    
    let notes = [];
    if (orderIds.length) {
      // Используем timestamp как в миграции PostgreSQL
      notes = await all(`SELECT * FROM order_notes WHERE order_id = ANY($1) ORDER BY timestamp ASC`, [orderIds]);
      console.log(`📝 Found ${notes.length} order notes`);
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
    const orderIdToNotes = new Map();
    for (const n of notes) {
      if (!orderIdToNotes.has(n.order_id)) orderIdToNotes.set(n.order_id, []);
      orderIdToNotes.get(n.order_id).push({
        id: n.id,
        text: n.text,
        type: n.type,
        timestamp: n.timestamp // Используем timestamp как в PostgreSQL
      });
    }

    const result = [];
    for (const o of orders) {
      const customer = o.customer_id ? await get(`SELECT * FROM customers WHERE id = $1`, [o.customer_id]) : null;
      console.log(`👤 Customer for order ${o.id}:`, customer ? 'found' : 'not found');
      
      result.push({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        pricing: JSON.parse(o.pricing_json || '{}'),
        items: orderIdToItems.get(o.id) || [],
        customerInfo: customer || { name: '', phone: '', email: null, address: null }, // Используем customerInfo вместо customer
        notes: orderIdToNotes.get(o.id) || [],
        createdAt: o.created_at,
        updatedAt: o.updated_at
      });
    }
    
    console.log(`✅ Returning ${result.length} formatted orders`);
    res.json(result);
  } catch (err) {
    console.error('❌ Ошибка при загрузке заказов с сервера:', err);
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    console.log('🛒 Creating order:', req.body);
    const { orderForm, cartItems, priceCalculation, orderNumber } = req.body;

    // customer
    let customerId = null;
    if (orderForm) {
      const r = await run(
        `INSERT INTO customers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING *`,
        [orderForm.name, orderForm.phone, orderForm.email ?? null, orderForm.address ?? null]
      );
      customerId = r.rows[0].id;
    }

    const id = String(orderNumber);
    await run(
      `INSERT INTO orders (id, order_number, customer_id, status, pricing_json) VALUES ($1, $2, $3, 'new', $4)`,
      [id, String(orderNumber), customerId, JSON.stringify(priceCalculation)]
    );

    if (Array.isArray(cartItems)) {
      for (const it of cartItems) {
        await run(
          `INSERT INTO order_items (order_id, product_id, title, price, quantity) VALUES ($1, $2, $3, $4, $5)`,
          [id, it.id ?? null, it.title, it.price, it.quantity]
        );
      }
    }

    console.log('✅ Order created successfully:', id);
    res.status(201).json({ ok: true, id, orderNumber });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Orders: update status
app.patch('/api/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log('🔄 Updating order status:', id, '→', status);
    await run(`UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2`, [status, id]);
    console.log('✅ Order status updated successfully');
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update status', details: error.message });
  }
});

// Orders: add note
app.post('/api/orders/:id/notes', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, type = 'note' } = req.body;
    console.log('📝 Adding note to order:', id, text);
    const r = await run(`INSERT INTO order_notes (order_id, text, type) VALUES ($1, $2, $3) RETURNING *`, [id, text, type]);
    console.log('✅ Note added successfully');
    res.status(201).json({ id: r.rows[0].id });
  } catch (error) {
    console.error('❌ Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note', details: error.message });
  }
});

// Orders: hard delete (used for cancelled orders cleanup)
app.delete('/api/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting order:', id);
    // Удаляем связанные записи явно
    await run(`DELETE FROM order_items WHERE order_id = $1`, [id]);
    await run(`DELETE FROM order_notes WHERE order_id = $1`, [id]);
    await run(`DELETE FROM orders WHERE id = $1`, [id]);
    console.log('✅ Order deleted successfully');
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order', details: error.message });
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
      '004_bot_settings_pg.sql',
      '005_vehicles_pg.sql'
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
