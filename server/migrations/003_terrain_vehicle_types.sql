-- Миграция для добавления таблиц типов местности и вездеходов
-- 003_terrain_vehicle_types.sql

-- Таблица типов местности
CREATE TABLE IF NOT EXISTS terrain_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Таблица типов вездеходов
CREATE TABLE IF NOT EXISTS vehicle_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Вставляем начальные данные для типов местности
INSERT OR IGNORE INTO terrain_types (name) VALUES 
  ('Снег'),
  ('Болото'),
  ('Вода'),
  ('Горы'),
  ('Лес'),
  ('Пустыня');

-- Вставляем начальные данные для типов вездеходов
INSERT OR IGNORE INTO vehicle_types (name) VALUES 
  ('Гусеничный'),
  ('Колесный'),
  ('Плавающий');
