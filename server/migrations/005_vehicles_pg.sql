-- PostgreSQL миграция для создания таблицы vehicles
-- 005_vehicles_pg.sql

-- Таблица вездеходов
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  terrain_type VARCHAR(100),
  vehicle_type VARCHAR(100),
  specifications TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Вставляем тестовые данные
INSERT INTO vehicles (name, description, terrain_type, vehicle_type, specifications) VALUES
('Гусеничный вездеход "Буран"', 'Мощный гусеничный вездеход для работы в сложных условиях', 'Снег', 'Гусеничный', '{"мощность": "150 л.с.", "грузоподъемность": "1000 кг", "скорость": "60 км/ч"}'),
('Колесный вездеход "Тундра"', 'Универсальный колесный вездеход для различных типов местности', 'Болото', 'Колесный', '{"мощность": "120 л.с.", "грузоподъемность": "800 кг", "скорость": "80 км/ч"}'),
('Плавающий вездеход "Амфибия"', 'Вездеход-амфибия для работы на воде и суше', 'Вода', 'Плавающий', '{"мощность": "100 л.с.", "грузоподъемность": "600 кг", "скорость": "40 км/ч"}');
