@echo off
echo ========================================
echo Миграция с SQLite на PostgreSQL
echo ========================================
echo.

REM Проверяем наличие PostgreSQL
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ОШИБКА: PostgreSQL не найден!
    echo Установите PostgreSQL с https://www.postgresql.org/download/windows/
    echo Или следуйте инструкциям в INSTALL_POSTGRES.md
    pause
    exit /b 1
)

echo ✓ PostgreSQL найден
echo.

REM Проверяем наличие .env файла
if not exist .env (
    echo Создаем файл .env из шаблона...
    copy env.example .env
    echo ✓ Файл .env создан
    echo ⚠️  Не забудьте настроить пароль PostgreSQL в файле .env
    echo.
)

REM Создаем базу данных если не существует
echo Создание базы данных ytorsweb...
createdb ytorsweb 2>nul
if %errorlevel% equ 0 (
    echo ✓ База данных ytorsweb создана
) else (
    echo ℹ База данных ytorsweb уже существует или ошибка создания
)
echo.

REM Создаем схему
echo Создание схемы PostgreSQL...
psql -U postgres -d ytorsweb -f postgres_schema.sql
if %errorlevel% equ 0 (
    echo ✓ Схема PostgreSQL создана
) else (
    echo ✗ Ошибка создания схемы
    pause
    exit /b 1
)
echo.

REM Инициализируем данные
echo Инициализация начальных данных...
psql -U postgres -d ytorsweb -f postgres_init_data.sql
if %errorlevel% equ 0 (
    echo ✓ Начальные данные добавлены
) else (
    echo ✗ Ошибка инициализации данных
    pause
    exit /b 1
)
echo.

REM Мигрируем данные
echo Миграция данных из SQLite...
node migrate_to_postgres.js
if %errorlevel% equ 0 (
    echo ✓ Данные успешно мигрированы
) else (
    echo ✗ Ошибка миграции данных
    pause
    exit /b 1
)
echo.

echo ========================================
echo ✅ Миграция завершена успешно!
echo ========================================
echo.
echo Следующие шаги:
echo 1. Проверьте настройки в файле .env
echo 2. Перезапустите сервер
echo 3. Проверьте работу сайта
echo.
pause
