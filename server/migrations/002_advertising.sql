-- Миграция для добавления таблицы рекламы
-- Создаем таблицу для хранения настроек рекламных платформ

CREATE TABLE IF NOT EXISTS advertising_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL UNIQUE,
  enabled INTEGER NOT NULL DEFAULT 0,
  settings_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Вставляем начальные настройки для всех платформ
INSERT OR IGNORE INTO advertising_settings (platform, enabled, settings_json) VALUES
  ('yandexDirect', 0, '{"counterId": "", "remarketingCode": "", "conversionCode": "", "pixelCode": ""}'),
  ('googleAds', 0, '{"conversionId": "", "conversionLabel": "", "remarketingCode": "", "gtagCode": ""}'),
  ('facebookPixel', 0, '{"pixelId": "", "conversionCode": ""}'),
  ('vkPixel', 0, '{"pixelId": "", "conversionCode": ""}'),
  ('telegramPixel', 0, '{"botToken": "", "chatId": ""}'),
  ('customScripts', 0, '{"headScripts": "", "bodyScripts": ""}');

-- Создаем индекс для быстрого поиска по платформе
CREATE INDEX IF NOT EXISTS idx_advertising_platform ON advertising_settings(platform);

-- Создаем таблицу для хранения событий рекламы (для аналитики)
CREATE TABLE IF NOT EXISTS advertising_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Создаем индекс для быстрого поиска событий по платформе и типу
CREATE INDEX IF NOT EXISTS idx_advertising_events_platform ON advertising_events(platform);
CREATE INDEX IF NOT EXISTS idx_advertising_events_type ON advertising_events(event_type);
CREATE INDEX IF NOT EXISTS idx_advertising_events_created ON advertising_events(created_at);
