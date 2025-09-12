-- Инициализация начальных данных для PostgreSQL

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

-- Вставляем начальные данные вездеходов
INSERT INTO vehicles (name, type, terrain, price, image, description, specs_json, available, quantity) VALUES 
  ('Вездеход "Буран"', 'Гусеничный', 'Снег', 2500000, '/img/vehicles/buran.jpg', 'Мощный гусеничный вездеход для работы в снежных условиях', '{"engine": "Дизель 150 л.с.", "weight": "2.5 тонны", "capacity": "6 человек", "maxSpeed": "45 км/ч"}', TRUE, 2),
  ('Вездеход "Трэкол"', 'Колесный', 'Болото', 1800000, '/img/vehicles/trekol.jpg', 'Высокопроходимый колесный вездеход для заболоченной местности', '{"engine": "Бензин 120 л.с.", "weight": "1.8 тонны", "capacity": "4 человека", "maxSpeed": "60 км/ч"}', TRUE, 3),
  ('Вездеход "Амфибия"', 'Плавающий', 'Вода', 3200000, '/img/vehicles/amphibian.jpg', 'Универсальный вездеход-амфибия для любых условий', '{"engine": "Дизель 200 л.с.", "weight": "3.2 тонны", "capacity": "8 человек", "maxSpeed": "35 км/ч (по воде 8 км/ч)"}', TRUE, 1),
  ('Вездеход "Горный"', 'Гусеничный', 'Горы', 2800000, '/img/vehicles/mountain.jpg', 'Специализированный вездеход для горной местности', '{"engine": "Дизель 180 л.с.", "weight": "2.8 тонны", "capacity": "5 человек", "maxSpeed": "40 км/ч"}', TRUE, 2),
  ('Вездеход "Лесник"', 'Колесный', 'Лес', 1500000, '/img/vehicles/forester.jpg', 'Компактный вездеход для лесных работ', '{"engine": "Бензин 90 л.с.", "weight": "1.2 тонны", "capacity": "3 человека", "maxSpeed": "50 км/ч"}', TRUE, 4),
  ('Вездеход "Арктик"', 'Гусеничный', 'Снег', 4500000, '/img/vehicles/arctic.jpg', 'Профессиональный вездеход для арктических экспедиций', '{"engine": "Дизель 250 л.с.", "weight": "4.5 тонны", "capacity": "10 человек", "maxSpeed": "30 км/ч"}', TRUE, 1)
ON CONFLICT DO NOTHING;

-- Вставляем начальный контент сайта
INSERT INTO site_content (content_key, content_data) VALUES 
  ('about_content', '{"homeHero": {"title": "Запчасти для вездеходов", "description": "Качественные запчасти для всех типов вездеходов. Быстрая доставка по всей России. Гарантия качества на все товары.", "ctaText": "Перейти в каталог", "ctaLink": "/catalog"}, "title": "О компании ВездеходЗапчасти", "description": "Мы специализируемся на поставке качественных запчастей для вездеходов всех типов и марок. Наша цель — обеспечить вас надежными комплектующими для безопасной и комфортной эксплуатации вашей техники."}'),
  ('delivery_payment', '{"steps": [{"title": "Оставляете заявку удобным способом", "description": "Заполните форму на сайте или свяжитесь с нашим менеджером — ответим в течение 10 минут."}, {"title": "Обработка заявки и счет-договор", "description": "Подтвердим наличие, согласуем условия и подготовим счет-договор сразу после согласования."}, {"title": "Подготовка товара и отгрузка", "description": "Оперативно комплектуем заказ и передаем в доставку выбранным вами способом."}], "deliveryMethods": [{"title": "Самовывоз", "description": "Можно забрать заказ самостоятельно со склада/пункта выдачи в Челябинске."}, {"title": "Бесплатная доставка по г. Челябинск", "description": "Доставим заказ по Челябинску бесплатно — быстро и аккуратно."}], "payment": {"whyPrepay": "Почему мы работаем по предоплате? Чтобы исключить риски возврата груза и простоев товара вне оборота на 1.5–2 месяца.", "requisites": "Оплата на расчётный счёт ООО «ЮТОРС», ИНН 7447296417, КПП 745101001."}}'),
  ('footer_content', '{"aboutSection": {"title": "О компании", "description": "Мы специализируемся на поставке качественных запчастей для вездеходов всех типов и марок."}, "contactsSection": {"title": "Контакты", "phone": "+7 (800) 123-45-67", "email": "info@vezdehod-zapchasti.ru", "address": "40-летия Победы, 16а, Курчатовский район, Челябинск, 454100"}, "copyright": "© 2024 ЮТОРС. Все права защищены."}')
ON CONFLICT (content_key) DO NOTHING;

-- Вставляем начальные настройки для всех рекламных платформ
INSERT INTO advertising_settings (platform, enabled, settings_json) VALUES
  ('yandexDirect', FALSE, '{"counterId": "", "remarketingCode": "", "conversionCode": "", "pixelCode": ""}'),
  ('googleAds', FALSE, '{"conversionId": "", "conversionLabel": "", "remarketingCode": "", "gtagCode": ""}'),
  ('facebookPixel', FALSE, '{"pixelId": "", "conversionCode": ""}'),
  ('vkPixel', FALSE, '{"pixelId": "", "conversionCode": ""}'),
  ('telegramPixel', FALSE, '{"botToken": "", "chatId": ""}'),
  ('customScripts', FALSE, '{"headScripts": "", "bodyScripts": ""}')
ON CONFLICT (platform) DO NOTHING;

-- Вставляем настройки фильтров по умолчанию
INSERT INTO filter_settings (setting_key, setting_value) VALUES
  ('showBrandFilter', 1),
  ('showCategoryFilter', 1),
  ('showSubcategoryFilter', 1),
  ('showPriceFilter', 1),
  ('showStockFilter', 1)
ON CONFLICT (setting_key) DO NOTHING;

-- Вставляем тестовые промокоды
INSERT INTO promocodes (code, description, discount_type, discount_value, min_purchase, max_uses, valid_until) VALUES 
  ('WELCOME10', 'Скидка 10% для новых клиентов', 'percentage', 10, 5000, 100, '2024-12-31 23:59:59'),
  ('SAVE500', 'Скидка 500 рублей при покупке от 10000', 'fixed', 500, 10000, 50, '2024-12-31 23:59:59'),
  ('SUMMER20', 'Летняя скидка 20%', 'percentage', 20, 15000, 200, '2024-08-31 23:59:59')
ON CONFLICT (code) DO NOTHING;
