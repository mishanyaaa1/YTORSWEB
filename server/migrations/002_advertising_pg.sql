-- PostgreSQL миграция для добавления таблицы рекламы
-- 002_advertising_pg.sql

-- Создаем таблицу для хранения настроек рекламных платформ
CREATE TABLE IF NOT EXISTS advertising_settings (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(100) NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  settings_json TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Вставляем начальные настройки для всех платформ
INSERT INTO advertising_settings (platform, enabled, settings_json) VALUES
  ('yandexDirect', false, '{"counterId": "", "remarketingCode": "", "conversionCode": "", "pixelCode": ""}'),
  ('googleAds', false, '{"conversionId": "", "conversionLabel": "", "remarketingCode": "", "gtagCode": ""}'),
  ('facebookPixel', false, '{"pixelId": "", "conversionCode": ""}'),
  ('vkPixel', false, '{"pixelId": "", "conversionCode": ""}'),
  ('telegramPixel', false, '{"botToken": "", "chatId": ""}'),
  ('customScripts', false, '{"headScripts": "", "bodyScripts": ""}')
ON CONFLICT (platform) DO NOTHING;

-- Создаем индекс для быстрого поиска по платформе
CREATE INDEX IF NOT EXISTS idx_advertising_platform ON advertising_settings(platform);

-- Создаем таблицу для хранения событий рекламы (для аналитики)
CREATE TABLE IF NOT EXISTS advertising_events (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Создаем индексы для быстрого поиска событий
CREATE INDEX IF NOT EXISTS idx_advertising_events_platform ON advertising_events(platform);
CREATE INDEX IF NOT EXISTS idx_advertising_events_type ON advertising_events(event_type);
CREATE INDEX IF NOT EXISTS idx_advertising_events_created ON advertising_events(created_at);
