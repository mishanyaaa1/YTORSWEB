const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, run, get } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret-in-env';

// Инициализация таблицы админов
async function ensureAdminTable() {
  await run(db, `
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  
  const row = await get(db, 'SELECT COUNT(1) as cnt FROM admins');
  if (!row || !row.cnt) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = await bcrypt.hash(password, 12);
    await run(db, 'INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, hash]);
    console.log('Создан админ по умолчанию:', username);
  }
}

// Вход в админку
router.post('/login', async (req, res) => {
  try {
    await ensureAdminTable();
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }
    
    const admin = await get(db, 'SELECT * FROM admins WHERE username = ?', [username]);
    
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.json({ message: 'Успешный вход', username: admin.username });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Выход из админки
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ message: 'Выход выполнен' });
});

// Проверка авторизации
router.get('/check', async (req, res) => {
  try {
    const token = req.cookies.admin_token;
    
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await get(db, 'SELECT username FROM admins WHERE id = ?', [decoded.id]);
    
    if (!admin) {
      return res.status(401).json({ authenticated: false });
    }
    
    res.json({ authenticated: true, username: admin.username });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
});

module.exports = router;
