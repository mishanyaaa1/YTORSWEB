@echo off
echo ========================================
echo Настройка Telegram бота для YTORSWEB
echo ========================================
echo.

echo Установка зависимостей сервера...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Ошибка установки зависимостей!
    pause
    exit /b 1
)

echo.
echo Инициализация базы данных и настроек бота...
call npm run migrate
if %errorlevel% neq 0 (
    echo Ошибка инициализации базы данных!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Настройка завершена!
echo ========================================
echo.
echo Теперь вы можете:
echo 1. Запустить сервер: npm start
echo 2. Войти в админку и настроить бота
echo 3. Протестировать отправку уведомлений
echo.
pause
