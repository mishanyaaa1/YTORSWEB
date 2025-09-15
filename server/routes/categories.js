const express = require('express');
const router = express.Router();
const { db, run, get, all } = require('../db');

// Получить все категории
router.get('/', async (req, res) => {
  try {
    const categories = await all(db, 'SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать категорию
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const result = await run(db, `
      INSERT INTO categories (name, description)
      VALUES (?, ?)
    `, [name, description]);
    
    res.json({ id: result.lastID, message: 'Категория создана' });
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить категорию
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    await run(db, `
      UPDATE categories 
      SET name = ?, description = ?
      WHERE id = ?
    `, [name, description, req.params.id]);
    
    res.json({ message: 'Категория обновлена' });
  } catch (error) {
    console.error('Ошибка обновления категории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить категорию
router.delete('/:id', async (req, res) => {
  try {
    await run(db, 'DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Категория удалена' });
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
