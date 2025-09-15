require('./load_env');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Базовая настройка
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cookieParser());
app.use(express.json({ limit: '25mb' }));

// CORS
app.use(cors({
  origin: ['http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // максимум 100 запросов
});
app.use('/api/', limiter);

// Создание папки для загрузок
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Настройка multer для загрузки файлов
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
    cb(ok ? null : new Error('Только изображения'), ok);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);

// Загрузка изображений
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  res.json({ filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});

// Получить все бренды
app.get('/api/brands', async (req, res) => {
  try {
    const { all } = require('./db');
    const brands = await all(require('./db').db, 'SELECT * FROM brands ORDER BY name');
    res.json(brands);
  } catch (error) {
    console.error('Ошибка получения брендов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить статистику (только для админа)
app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    const { db, get, all } = require('./db');
    
    const productCount = await get(db, 'SELECT COUNT(*) as count FROM products');
    const categoryCount = await get(db, 'SELECT COUNT(*) as count FROM categories');
    const brandCount = await get(db, 'SELECT COUNT(*) as count FROM brands');
    
    res.json({
      products: productCount.count,
      categories: categoryCount.count,
      brands: brandCount.count
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обработка ошибок
app.use((error, req, res, next) => {
  console.error('Ошибка сервера:', error);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// 404 обработчик
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📁 Загрузки: http://localhost:${PORT}/uploads`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});
