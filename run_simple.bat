@echo off
echo Запуск упрощенной версии YTORSWEB...

echo.
echo Запуск клиента...
start "YTORS Client" cmd /k "npm run dev"

echo.
echo Клиент запущен!
echo Клиент: http://localhost:5174
echo Админка: http://localhost:5174/admin
echo.
pause
