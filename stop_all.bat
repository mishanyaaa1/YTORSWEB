@echo off
echo ========================================
echo    ОСТАНОВКА ВСЕХ ПРОЦЕССОВ
echo ========================================
echo.

echo Останавливаю все процессы Node.js...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Все процессы остановлены!
echo.
pause
