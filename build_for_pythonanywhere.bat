@echo off
echo 🔧 Начинаем сборку проекта для PythonAnywhere...

echo 🚀 Проверка версии Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js не найден. Установите Node.js и попробуйте снова.
    pause
    exit /b 1
)

echo 🚀 Проверка версии npm...
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm не найден. Установите npm и попробуйте снова.
    pause
    exit /b 1
)

echo 🚀 Установка npm зависимостей...
npm install
if %errorlevel% neq 0 (
    echo ❌ Не удалось установить npm зависимости.
    pause
    exit /b 1
)

echo 🚀 Сборка React приложения...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Не удалось собрать React приложение.
    pause
    exit /b 1
)

echo 📁 Копируем собранные файлы в папку static...

if not exist "static" mkdir static
if not exist "static\css" mkdir static\css
if not exist "static\js" mkdir static\js
if not exist "static\assets" mkdir static\assets

echo 📄 Копируем CSS файлы...
for %%f in (dist\*.css) do (
    copy "%%f" "static\css\"
    echo    Скопирован CSS файл: %%~nxf
)

echo 📄 Копируем JS файлы...
for %%f in (dist\*.js) do (
    copy "%%f" "static\js\"
    echo    Скопирован JS файл: %%~nxf
)

echo 📄 Копируем папку assets...
if exist "dist\assets" (
    xcopy "dist\assets\*" "static\assets\" /E /I /Y
    echo    Скопирована папка assets
)

echo 📄 Копируем другие статические файлы...
for %%f in (dist\*.ico dist\*.png dist\*.jpg dist\*.jpeg dist\*.gif dist\*.svg dist\*.webp) do (
    if exist "%%f" (
        copy "%%f" "static\"
        echo    Скопирован файл: %%~nxf
    )
)

echo 📄 Копируем базу данных...
if exist "server\db.sqlite3" (
    copy "server\db.sqlite3" "db.sqlite3"
    echo    Скопирована база данных
)

echo 📁 Копируем папку uploads...
if exist "server\uploads" (
    if exist "uploads" rmdir /s /q "uploads"
    xcopy "server\uploads" "uploads\" /E /I /Y
    echo    Скопирована папка uploads
)

echo.
echo ✅ Сборка завершена успешно!
echo.
echo 📋 Файлы для загрузки на PythonAnywhere:
echo    - app.py
echo    - wsgi.py
echo    - config.py
echo    - requirements.txt
echo    - .python-version
echo    - db.sqlite3
echo    - папка static/
echo    - папка templates/
echo    - папка uploads/
echo.
echo 🚀 Инструкции по развертыванию:
echo    1. Загрузите все файлы на PythonAnywhere
echo    2. Установите зависимости: pip install -r requirements.txt
echo    3. Настройте WSGI файл в настройках PythonAnywhere
echo    4. Укажите путь к wsgi.py в настройках
echo    5. Перезапустите веб-приложение
echo.
pause
