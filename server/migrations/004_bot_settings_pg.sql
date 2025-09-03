-- PostgreSQL миграция для добавления таблицы настроек бота
-- 004_bot_settings_pg.sql

-- Создаем таблицу для настроек бота
CREATE TABLE IF NOT EXISTS bot_settings (
  id SERIAL PRIMARY KEY,
  bot_token VARCHAR(500),
  chat_id VARCHAR(100),
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Вставляем начальные настройки бота
INSERT INTO bot_settings (bot_token, chat_id, enabled) VALUES 
  ('', '', false)
ON CONFLICT DO NOTHING;
