-- Миграция для добавления таблицы готовых вездеходов
PRAGMA foreign_keys = ON;

-- Таблица готовых вездеходов
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  brand_id INTEGER,
  model TEXT,
  year INTEGER,
  engine_power INTEGER, -- мощность двигателя в л.с.
  engine_volume REAL, -- объем двигателя в литрах
  fuel_type TEXT, -- тип топлива
  transmission TEXT, -- тип трансмиссии
  drive_type TEXT, -- тип привода
  seats INTEGER, -- количество мест
  weight INTEGER, -- вес в кг
  dimensions TEXT, -- габариты (длина x ширина x высота)
  description TEXT,
  specifications_json TEXT,
  features_json TEXT,
  available INTEGER NOT NULL DEFAULT 1,
  quantity INTEGER NOT NULL DEFAULT 1,
  featured INTEGER NOT NULL DEFAULT 0, -- выделенный товар
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

-- Изображения вездеходов
CREATE TABLE IF NOT EXISTS vehicle_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL,
  image_data TEXT NOT NULL,
  is_main INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON vehicles(available);
CREATE INDEX IF NOT EXISTS idx_vehicles_featured ON vehicles(featured);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_main ON vehicle_images(is_main);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_sort ON vehicle_images(sort_order);
