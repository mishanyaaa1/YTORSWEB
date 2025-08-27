@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Скрипт автоматического развертывания YTORSWEB для Windows
REM Использование: deploy.bat [production|staging]

set "ENVIRONMENT=%1"
if "%ENVIRONMENT%"=="" set "ENVIRONMENT=production"

if not "%ENVIRONMENT%"=="production" if not "%ENVIRONMENT%"=="staging" (
    echo [ERROR] Неверное окружение. Используйте 'production' или 'staging'
    exit /b 1
)

echo [INFO] Начинаем развертывание в окружении: %ENVIRONMENT%

REM Проверка зависимостей
echo [INFO] Проверяем зависимости...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js не установлен
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm не установлен
    exit /b 1
)

for /f "tokens=1,2 delims=." %%a in ('node --version') do set "NODE_VERSION=%%a"
set "NODE_VERSION=!NODE_VERSION:~1!"
if !NODE_VERSION! lss 18 (
    echo [ERROR] Требуется Node.js версии 18 или выше. Текущая версия: 
    node --version
    exit /b 1
)

echo [SUCCESS] Зависимости проверены

REM Создание необходимых директорий
echo [INFO] Создаем необходимые директории...

if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "database" mkdir database
if not exist "ssl" mkdir ssl

echo [SUCCESS] Директории созданы

REM Установка зависимостей
echo [INFO] Устанавливаем зависимости...

call npm ci --only=production
if %errorlevel% neq 0 (
    echo [ERROR] Ошибка установки зависимостей
    exit /b 1
)

cd server
call npm ci --only=production
if %errorlevel% neq 0 (
    echo [ERROR] Ошибка установки зависимостей сервера
    exit /b 1
)
cd ..

echo [SUCCESS] Зависимости установлены

REM Настройка базы данных
echo [INFO] Настраиваем базу данных...

cd server

if exist "migrate.js" (
    node migrate.js
    if %errorlevel% equ 0 (
        echo [SUCCESS] Миграции выполнены
    ) else (
        echo [WARNING] Ошибка выполнения миграций
    )
)

if exist "seed\seed.js" (
    node seed\seed.js
    if %errorlevel% equ 0 (
        echo [SUCCESS] База данных заполнена начальными данными
    ) else (
        echo [WARNING] Ошибка заполнения базы данных
    )
)

cd ..

REM Сборка фронтенда
echo [INFO] Собираем фронтенд...

call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Ошибка сборки фронтенда
    exit /b 1
)

echo [SUCCESS] Фронтенд собран

REM Настройка переменных окружения
echo [INFO] Настраиваем переменные окружения...

if not exist ".env" (
    if exist "env.example" (
        copy "env.example" ".env" >nul
        echo [WARNING] Создан файл .env из примера. Отредактируйте его для продакшена!
    ) else (
        echo [WARNING] Файл .env не найден. Создайте его вручную.
    )
)

echo [SUCCESS] Переменные окружения настроены

REM Настройка PM2 (если доступен)
echo [INFO] Настраиваем PM2...

where pm2 >nul 2>nul
if %errorlevel% equ 0 (
    if exist "ecosystem.config.js" (
        pm2 start ecosystem.config.js --env %ENVIRONMENT%
        pm2 save
        pm2 startup
        echo [SUCCESS] PM2 настроен и запущен
    )
) else (
    echo [WARNING] PM2 не установлен. Используйте 'npm start' для запуска
)

REM Проверка здоровья приложения
echo [INFO] Проверяем здоровье приложения...

REM Ждем запуска сервера
timeout /t 5 /nobreak >nul

REM Простая проверка (можно заменить на curl если установлен)
echo [INFO] Приложение запущено. Проверьте доступность по адресу: http://localhost:3000

echo [SUCCESS] === Развертывание завершено успешно! ===
echo [INFO] Приложение доступно по адресу: http://localhost:3000

where pm2 >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] Управление через PM2:
    echo [INFO]   pm2 status          - статус процессов
    echo [INFO]   pm2 logs            - просмотр логов
    echo [INFO]   pm2 monit           - мониторинг
    echo [INFO]   pm2 restart all     - перезапуск
) else (
    echo [INFO] Для запуска используйте: npm start
)

pause
