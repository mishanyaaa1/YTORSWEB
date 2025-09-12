-- Команды для создания базы данных PostgreSQL
-- Выполните эти команды после установки PostgreSQL

-- 1. Создание базы данных
CREATE DATABASE ytorsweb;

-- 2. Создание пользователя (опционально)
-- CREATE USER ytorsweb_user WITH PASSWORD 'your_password';
-- GRANT ALL PRIVILEGES ON DATABASE ytorsweb TO ytorsweb_user;

-- 3. Подключение к базе данных
-- \c ytorsweb;

-- 4. Включение расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
