# 🚀 Полное руководство по миграции на PostgreSQL

## 📋 Что было сделано

✅ Создана PostgreSQL схема (`postgres_schema.sql`)  
✅ Создан скрипт инициализации данных (`postgres_init_data.sql`)  
✅ Создан скрипт миграции данных (`migrate_to_postgres.js`)  
✅ Создан модуль для работы с PostgreSQL (`db_postgres.js`)  
✅ Создан переключатель баз данных (`db_switch.js`)  
✅ Обновлен основной сервер для поддержки обеих БД  
✅ Добавлены зависимости в `package.json`  
✅ Созданы скрипты автоматизации  

## 🛠️ Быстрый старт

### 1. Установите PostgreSQL
- Windows: https://www.postgresql.org/download/windows/
- Или используйте Docker: `docker run --name postgres-ytorsweb -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ytorsweb -p 5432:5432 -d postgres:15`

### 2. Запустите автоматическую миграцию
```bash
# Windows
migrate_to_postgres.bat

# Или вручную
createdb ytorsweb
psql -U postgres -d ytorsweb -f postgres_schema.sql
psql -U postgres -d ytorsweb -f postgres_init_data.sql
node migrate_to_postgres.js
```

### 3. Настройте переменные окружения
Скопируйте `env.example` в `.env` и настройте:
```env
DATABASE_TYPE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ваш_пароль
POSTGRES_DB=ytorsweb
```

### 4. Перезапустите сервер
```bash
npm start
```

## 📊 Проверка миграции

```bash
node check_migration.js
```

## 🔄 Переключение между базами данных

В файле `.env` измените:
```env
# Для SQLite
DATABASE_TYPE=sqlite

# Для PostgreSQL  
DATABASE_TYPE=postgres
```

## 📁 Созданные файлы

### Схема и данные
- `postgres_schema.sql` - Схема PostgreSQL (таблицы, индексы)
- `postgres_init_data.sql` - Начальные данные
- `create_database_commands.sql` - Команды создания БД

### Скрипты миграции
- `migrate_to_postgres.js` - Основной скрипт миграции
- `migrate_to_postgres.bat` - Автоматический скрипт для Windows
- `check_migration.js` - Проверка результатов миграции

### Модули базы данных
- `db_postgres.js` - Модуль для работы с PostgreSQL
- `db_switch.js` - Переключатель между SQLite и PostgreSQL
- `load_env.js` - Загрузка переменных окружения

### Документация
- `POSTGRES_MIGRATION.md` - Подробное руководство
- `INSTALL_POSTGRES.md` - Инструкция по установке PostgreSQL
- `env.example` - Пример конфигурации

## 🗃️ Структура таблиц

Миграция включает **18 таблиц**:

### Основные
- `admins` - Администраторы
- `categories`, `subcategories` - Категории товаров
- `brands` - Бренды
- `products`, `product_images` - Товары и изображения

### Заказы
- `customers` - Клиенты
- `orders`, `order_items`, `order_notes` - Заказы

### Вездеходы
- `terrain_types`, `vehicle_types` - Типы местности и вездеходов
- `vehicles`, `vehicle_images` - Вездеходы и изображения

### Контент и настройки
- `site_content` - Контент сайта
- `advertising_settings`, `advertising_events` - Реклама
- `filter_settings` - Настройки фильтров
- `promocodes` - Промокоды
- `popular_products` - Популярные товары
- `promotions` - Акции
- `bot_settings`, `email_settings` - Настройки

## ⚡ Преимущества PostgreSQL

- **Производительность**: Лучше работает с большими объемами данных
- **Масштабируемость**: Поддержка множественных подключений
- **Надежность**: ACID транзакции, резервное копирование
- **Функциональность**: Расширенные типы данных, индексы, триггеры
- **Безопасность**: Роли пользователей, шифрование

## 🔧 Устранение неполадок

### Ошибка подключения
```bash
# Проверьте, что PostgreSQL запущен
pg_ctl status

# Проверьте настройки в .env
cat .env
```

### Ошибка миграции
```bash
# Проверьте логи
node migrate_to_postgres.js

# Проверьте схему
psql -U postgres -d ytorsweb -c "\dt"
```

### Откат к SQLite
1. Измените `DATABASE_TYPE=sqlite` в `.env`
2. Перезапустите сервер
3. Восстановите резервную копию `db.sqlite3.backup`

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в консоли
2. Убедитесь в правильности настроек в `.env`
3. Проверьте, что PostgreSQL запущен
4. Запустите `node check_migration.js` для диагностики

---

**🎉 Готово!** Ваша база данных успешно мигрирована на PostgreSQL!
