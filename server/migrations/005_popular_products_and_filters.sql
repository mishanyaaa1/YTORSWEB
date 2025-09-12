-- Миграция для добавления таблиц популярных товаров и настроек фильтров
-- 005_popular_products_and_filters.sql

-- Таблица для хранения популярных товаров
CREATE TABLE IF NOT EXISTS popular_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id)
);

-- Создаем индекс для быстрого поиска по порядку сортировки
CREATE INDEX IF NOT EXISTS idx_popular_products_sort_order ON popular_products(sort_order);

-- Таблица для настроек фильтров каталога
CREATE TABLE IF NOT EXISTS filter_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Вставляем настройки фильтров по умолчанию
INSERT OR IGNORE INTO filter_settings (setting_key, setting_value) VALUES
  ('showBrandFilter', 1),
  ('showCategoryFilter', 1),
  ('showSubcategoryFilter', 1),
  ('showPriceFilter', 1),
  ('showStockFilter', 1);

-- Создаем индекс для быстрого поиска настроек
CREATE INDEX IF NOT EXISTS idx_filter_settings_key ON filter_settings(setting_key);
