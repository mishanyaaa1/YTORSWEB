-- Миграция для добавления таблиц вездеходов и контента сайта
-- 004_vehicles_and_content.sql

-- Таблица вездеходов (пересоздаем если нужно)
DROP TABLE IF EXISTS vehicles;
CREATE TABLE vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  terrain TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT,
  description TEXT,
  specs_json TEXT,
  available INTEGER NOT NULL DEFAULT 1,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (type) REFERENCES vehicle_types(name) ON DELETE SET NULL,
  FOREIGN KEY (terrain) REFERENCES terrain_types(name) ON DELETE SET NULL
);

-- Таблица контента сайта
CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_key TEXT NOT NULL UNIQUE,
  content_data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_vehicles_terrain ON vehicles(terrain);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON vehicles(available);
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(content_key);

-- Вставляем начальные данные вездеходов
INSERT OR IGNORE INTO vehicles (name, type, terrain, price, image, description, specs_json, available, quantity) VALUES 
  ('Вездеход "Буран"', 'Гусеничный', 'Снег', 2500000, '/img/vehicles/buran.jpg', 'Мощный гусеничный вездеход для работы в снежных условиях', '{"engine": "Дизель 150 л.с.", "weight": "2.5 тонны", "capacity": "6 человек", "maxSpeed": "45 км/ч"}', 1, 2),
  ('Вездеход "Трэкол"', 'Колесный', 'Болото', 1800000, '/img/vehicles/trekol.jpg', 'Высокопроходимый колесный вездеход для заболоченной местности', '{"engine": "Бензин 120 л.с.", "weight": "1.8 тонны", "capacity": "4 человека", "maxSpeed": "60 км/ч"}', 1, 3),
  ('Вездеход "Амфибия"', 'Плавающий', 'Вода', 3200000, '/img/vehicles/amphibian.jpg', 'Универсальный вездеход-амфибия для любых условий', '{"engine": "Дизель 200 л.с.", "weight": "3.2 тонны", "capacity": "8 человек", "maxSpeed": "35 км/ч (по воде 8 км/ч)"}', 1, 1),
  ('Вездеход "Горный"', 'Гусеничный', 'Горы', 2800000, '/img/vehicles/mountain.jpg', 'Специализированный вездеход для горной местности', '{"engine": "Дизель 180 л.с.", "weight": "2.8 тонны", "capacity": "5 человек", "maxSpeed": "40 км/ч"}', 1, 2),
  ('Вездеход "Лесник"', 'Колесный', 'Лес', 1500000, '/img/vehicles/forester.jpg', 'Компактный вездеход для лесных работ', '{"engine": "Бензин 90 л.с.", "weight": "1.2 тонны", "capacity": "3 человека", "maxSpeed": "50 км/ч"}', 1, 4),
  ('Вездеход "Арктик"', 'Гусеничный', 'Снег', 4500000, '/img/vehicles/arctic.jpg', 'Профессиональный вездеход для арктических экспедиций', '{"engine": "Дизель 250 л.с.", "weight": "4.5 тонны", "capacity": "10 человек", "maxSpeed": "30 км/ч"}', 1, 1);

-- Вставляем начальный контент сайта
INSERT OR IGNORE INTO site_content (content_key, content_data) VALUES 
  ('about_content', '{"homeHero": {"title": "Запчасти для вездеходов", "description": "Качественные запчасти для всех типов вездеходов. Быстрая доставка по всей России. Гарантия качества на все товары.", "ctaText": "Перейти в каталог", "ctaLink": "/catalog"}, "title": "О компании ВездеходЗапчасти", "description": "Мы специализируемся на поставке качественных запчастей для вездеходов всех типов и марок. Наша цель — обеспечить вас надежными комплектующими для безопасной и комфортной эксплуатации вашей техники."}'),
  ('delivery_payment', '{"steps": [{"title": "Оставляете заявку удобным способом", "description": "Заполните форму на сайте или свяжитесь с нашим менеджером — ответим в течение 10 минут."}, {"title": "Обработка заявки и счет-договор", "description": "Подтвердим наличие, согласуем условия и подготовим счет-договор сразу после согласования."}, {"title": "Подготовка товара и отгрузка", "description": "Оперативно комплектуем заказ и передаем в доставку выбранным вами способом."}], "deliveryMethods": [{"title": "Самовывоз", "description": "Можно забрать заказ самостоятельно со склада/пункта выдачи в Челябинске."}, {"title": "Бесплатная доставка по г. Челябинск", "description": "Доставим заказ по Челябинску бесплатно — быстро и аккуратно."}], "payment": {"whyPrepay": "Почему мы работаем по предоплате? Чтобы исключить риски возврата груза и простоев товара вне оборота на 1.5–2 месяца.", "requisites": "Оплата на расчётный счёт ООО «ЮТОРС», ИНН 7447296417, КПП 745101001."}}'),
  ('footer_content', '{"aboutSection": {"title": "О компании", "description": "Мы специализируемся на поставке качественных запчастей для вездеходов всех типов и марок."}, "contactsSection": {"title": "Контакты", "phone": "+7 (800) 123-45-67", "email": "info@vezdehod-zapchasti.ru", "address": "40-летия Победы, 16а, Курчатовский район, Челябинск, 454100"}, "copyright": "© 2024 ЮТОРС. Все права защищены."}');
