# Миграция с SQLite на PostgreSQL

Этот документ описывает процесс миграции базы данных проекта с SQLite на PostgreSQL.

## Предварительные требования

1. **PostgreSQL** должен быть установлен на вашей системе
2. **Node.js** с npm
3. Существующая SQLite база данных в файле `db.sqlite3`

## Пошаговая инструкция

### 1. Установка зависимостей

```bash
npm install pg
```

### 2. Настройка PostgreSQL

#### Создание базы данных

```bash
# Через createdb
createdb ytorsweb

# Или через psql
psql -U postgres
CREATE DATABASE ytorsweb;
\q
```

#### Создание пользователя (опционально)

```bash
psql -U postgres
CREATE USER ytorsweb_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ytorsweb TO ytorsweb_user;
\q
```

### 3. Конфигурация

Скопируйте файл `.env.example` в `.env` и настройте параметры подключения:

```env
# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_DB=ytorsweb
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432

# Тип базы данных
DATABASE_TYPE=postgres
```

### 4. Создание схемы PostgreSQL

```bash
psql -U postgres -d ytorsweb -f postgres_schema.sql
```

### 5. Инициализация начальных данных

```bash
psql -U postgres -d ytorsweb -f postgres_init_data.sql
```

### 6. Миграция данных из SQLite

```bash
node migrate_to_postgres.js
```

### 7. Проверка миграции

```bash
# Проверить количество записей в основных таблицах
psql -U postgres -d ytorsweb -c "SELECT 'products' as table_name, count(*) as count FROM products UNION ALL SELECT 'vehicles', count(*) FROM vehicles UNION ALL SELECT 'orders', count(*) FROM orders;"
```

## Файлы миграции

- `postgres_schema.sql` - Схема PostgreSQL (таблицы, индексы)
- `postgres_init_data.sql` - Начальные данные
- `migrate_to_postgres.js` - Скрипт миграции данных
- `db_postgres.js` - Модуль для работы с PostgreSQL
- `db_switch.js` - Переключатель между типами БД

## Структура таблиц

Миграция включает следующие таблицы:

### Основные таблицы
- `admins` - Администраторы
- `categories` - Категории товаров
- `subcategories` - Подкатегории
- `brands` - Бренды
- `products` - Товары
- `product_images` - Изображения товаров

### Заказы
- `customers` - Клиенты
- `orders` - Заказы
- `order_items` - Позиции заказов
- `order_notes` - Заметки к заказам

### Вездеходы
- `terrain_types` - Типы местности
- `vehicle_types` - Типы вездеходов
- `vehicles` - Вездеходы
- `vehicle_images` - Изображения вездеходов

### Контент и настройки
- `site_content` - Контент сайта
- `advertising_settings` - Настройки рекламы
- `advertising_events` - События рекламы
- `filter_settings` - Настройки фильтров
- `promocodes` - Промокоды
- `popular_products` - Популярные товары
- `bot_settings` - Настройки бота
- `email_settings` - Настройки email

### Акции
- `promotions` - Акции

## Отличия от SQLite

### Типы данных
- `INTEGER` → `SERIAL` для автоинкремента
- `TEXT` → `VARCHAR(255)` или `TEXT`
- `INTEGER` (boolean) → `BOOLEAN`
- `datetime('now')` → `NOW()`

### Функции
- `PRAGMA foreign_keys = ON` → Автоматически включены
- `INSERT OR IGNORE` → `ON CONFLICT DO NOTHING`
- `AUTOINCREMENT` → `SERIAL`

## Переключение между базами данных

Для переключения между SQLite и PostgreSQL измените переменную `DATABASE_TYPE` в файле `.env`:

```env
# Для SQLite
DATABASE_TYPE=sqlite

# Для PostgreSQL  
DATABASE_TYPE=postgres
```

## Устранение неполадок

### Ошибка подключения к PostgreSQL
- Проверьте, что PostgreSQL запущен
- Убедитесь в правильности параметров подключения в `.env`
- Проверьте права доступа пользователя к базе данных

### Ошибки миграции данных
- Убедитесь, что схема PostgreSQL создана
- Проверьте, что SQLite база данных существует и доступна
- Проверьте логи ошибок в консоли

### Проблемы с типами данных
- Некоторые данные могут требовать ручной корректировки
- Проверьте логи миграции на предмет ошибок конвертации

## Резервное копирование

Перед миграцией обязательно создайте резервную копию:

```bash
# SQLite
cp db.sqlite3 db.sqlite3.backup

# PostgreSQL (после миграции)
pg_dump -U postgres ytorsweb > ytorsweb_backup.sql
```

## Откат миграции

Для возврата к SQLite:
1. Измените `DATABASE_TYPE=sqlite` в `.env`
2. Перезапустите сервер
3. Восстановите резервную копию SQLite при необходимости
