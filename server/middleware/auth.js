const jwt = require('jsonwebtoken');
const { db, get } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret-in-env';

// Middleware для проверки авторизации админа
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.admin_token;
    
    if (!token) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await get(db, 'SELECT id, username FROM admins WHERE id = ?', [decoded.id]);
    
    if (!admin) {
      return res.status(401).json({ error: 'Неверный токен' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error);
    res.status(401).json({ error: 'Неверный токен' });
  }
};

module.exports = { requireAuth };
