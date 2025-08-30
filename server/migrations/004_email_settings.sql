-- Миграция для добавления таблицы email настроек
-- 004_email_settings.sql

-- Создаем таблицу для настроек email (только recipient_email)
CREATE TABLE IF NOT EXISTS email_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_email TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Вставляем дефолтные настройки
INSERT OR IGNORE INTO email_settings (recipient_email, enabled)
VALUES ('', 1);
