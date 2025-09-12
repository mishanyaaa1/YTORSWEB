-- Миграция для добавления таблицы промокодов
-- 005_promocodes.sql

-- Таблица промокодов
CREATE TABLE IF NOT EXISTS promocodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' или 'fixed'
  discount_value INTEGER NOT NULL, -- процент или фиксированная сумма
  min_purchase INTEGER DEFAULT 0, -- минимальная сумма покупки
  max_uses INTEGER DEFAULT NULL, -- максимальное количество использований (NULL = без ограничений)
  used_count INTEGER NOT NULL DEFAULT 0, -- количество использований
  valid_from TEXT, -- дата начала действия (NULL = с момента создания)
  valid_until TEXT, -- дата окончания действия (NULL = бессрочно)
  active INTEGER NOT NULL DEFAULT 1, -- активен ли промокод
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Создаем индекс для быстрого поиска по коду
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_promocodes_active ON promocodes(active);

-- Вставляем тестовые промокоды
INSERT OR IGNORE INTO promocodes (code, description, discount_type, discount_value, min_purchase, max_uses, valid_until) VALUES 
  ('WELCOME10', 'Скидка 10% для новых клиентов', 'percentage', 10, 5000, 100, '2024-12-31'),
  ('SAVE500', 'Скидка 500 рублей при покупке от 10000', 'fixed', 500, 10000, 50, '2024-12-31'),
  ('SUMMER20', 'Летняя скидка 20%', 'percentage', 20, 15000, 200, '2024-08-31');
