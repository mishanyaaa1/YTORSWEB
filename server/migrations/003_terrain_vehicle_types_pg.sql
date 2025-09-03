-- PostgreSQL миграция для добавления таблиц типов местности и вездеходов
-- 003_terrain_vehicle_types_pg.sql

-- Таблица типов местности
CREATE TABLE IF NOT EXISTS terrain_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица типов вездеходов
CREATE TABLE IF NOT EXISTS vehicle_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Вставляем начальные данные для типов местности
INSERT INTO terrain_types (name) VALUES 
  ('Снег'),
  ('Болото'),
  ('Вода'),
  ('Горы'),
  ('Лес'),
  ('Пустыня')
ON CONFLICT (name) DO NOTHING;

-- Вставляем начальные данные для типов вездеходов
INSERT INTO vehicle_types (name) VALUES 
  ('Гусеничный'),
  ('Колесный'),
  ('Плавающий')
ON CONFLICT (name) DO NOTHING;
