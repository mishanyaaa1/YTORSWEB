@echo off
chcp 65001 >nul
echo ========================================
echo    Установка YTORSWEB на хостинг
echo ========================================
echo.

echo [1/6] Проверка зависимостей...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не установлен!
    echo Скачайте и установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] npm не установлен!
    pause
    exit /b 1
)

echo [OK] Node.js и npm найдены
echo.

echo [2/6] Создание директорий...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "database" mkdir database
if not exist "ssl" mkdir ssl
echo [OK] Директории созданы
echo.

echo [3/6] Установка зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось установить зависимости!
    pause
    exit /b 1
)

cd server
call npm install
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось установить зависимости сервера!
    pause
    exit /b 1
)
cd ..
echo [OK] Зависимости установлены
echo.

echo [4/6] Сборка фронтенда...
call npm run build
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось собрать фронтенд!
    pause
    exit /b 1
)
echo [OK] Фронтенд собран
echo.

echo [5/6] Настройка переменных окружения...
if not exist ".env" (
    if exist "env.example" (
        copy "env.example" ".env" >nul
        echo [ВНИМАНИЕ] Создан файл .env из примера
        echo Отредактируйте его для продакшена!
    ) else (
        echo [ВНИМАНИЕ] Создайте файл .env вручную
    )
)
echo [OK] Переменные окружения настроены
echo.

echo [6/6] Настройка базы данных...
cd server
if exist "migrate.js" (
    node migrate.js
    echo [OK] Миграции выполнены
)
if exist "seed\seed.js" (
    node seed\seed.js
    echo [OK] База данных заполнена
)
cd ..
echo.

echo ========================================
echo    Установка завершена успешно!
echo ========================================
echo.
echo Для запуска используйте:
echo   npm start
echo.
echo Или для разработки:
echo   npm run dev
echo.
echo Приложение будет доступно по адресу:
echo   http://localhost:3000
echo.
pause
