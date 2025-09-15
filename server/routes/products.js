const express = require('express');
const router = express.Router();
const { db, run, get, all } = require('../db');

// Получить все продукты
router.get('/', async (req, res) => {
  try {
    const products = await all(db, `
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.created_at DESC
    `);
    res.json(products);
  } catch (error) {
    console.error('Ошибка получения продуктов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить продукт по ID
router.get('/:id', async (req, res) => {
  try {
    const product = await get(db, `
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (!product) {
      return res.status(404).json({ error: 'Продукт не найден' });
    }
    res.json(product);
  } catch (error) {
    console.error('Ошибка получения продукта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать продукт
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category_id, brand_id, image_url } = req.body;
    
    const result = await run(db, `
      INSERT INTO products (name, description, price, category_id, brand_id, image_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [name, description, price, category_id, brand_id, image_url]);
    
    res.json({ id: result.lastID, message: 'Продукт создан' });
  } catch (error) {
    console.error('Ошибка создания продукта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить продукт
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, category_id, brand_id, image_url } = req.body;
    
    await run(db, `
      UPDATE products 
      SET name = ?, description = ?, price = ?, category_id = ?, brand_id = ?, image_url = ?
      WHERE id = ?
    `, [name, description, price, category_id, brand_id, image_url, req.params.id]);
    
    res.json({ message: 'Продукт обновлен' });
  } catch (error) {
    console.error('Ошибка обновления продукта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить продукт
router.delete('/:id', async (req, res) => {
  try {
    await run(db, 'DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Продукт удален' });
  } catch (error) {
    console.error('Ошибка удаления продукта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
