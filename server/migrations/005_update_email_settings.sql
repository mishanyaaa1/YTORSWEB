-- Миграция для обновления таблицы email настроек
-- 005_update_email_settings.sql

-- Удаляем старую таблицу
DROP TABLE IF EXISTS email_settings;

-- Создаем новую таблицу с упрощенной структурой
CREATE TABLE email_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_email TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Вставляем дефолтные настройки
INSERT INTO email_settings (recipient_email, enabled)
VALUES ('', 1);
