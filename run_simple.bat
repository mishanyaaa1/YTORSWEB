@echo off
echo Запуск упрощенной версии YTORSWEB...

echo.
echo Запуск сервера...
cd server
start "YTORS Server" cmd /k "node index_simple.js"

echo.
echo Ожидание запуска сервера...
timeout /t 3 /nobreak >nul

echo.
echo Запуск клиента...
cd ..
start "YTORS Client" cmd /k "npm run dev"

echo.
echo Оба сервиса запущены!
echo Сервер: http://localhost:3001
echo Клиент: http://localhost:5174
echo Админка: http://localhost:5174/admin
echo.
pause
