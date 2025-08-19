Write-Host "🔧 Начинаем сборку проекта для PythonAnywhere..." -ForegroundColor Green

# Проверяем наличие Node.js
Write-Host "🚀 Проверка версии Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js версия: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js не найден. Установите Node.js и попробуйте снова." -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Проверяем наличие npm
Write-Host "🚀 Проверка версии npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm версия: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm не найден. Установите npm и попробуйте снова." -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Устанавливаем зависимости
Write-Host "🚀 Установка npm зависимостей..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ npm зависимости установлены" -ForegroundColor Green
} catch {
    Write-Host "❌ Не удалось установить npm зависимости." -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Собираем React приложение
Write-Host "🚀 Сборка React приложения..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ React приложение собрано" -ForegroundColor Green
} catch {
    Write-Host "❌ Не удалось собрать React приложение." -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Проверяем, что папка dist создана
if (-not (Test-Path "dist")) {
    Write-Host "❌ Папка dist не найдена после сборки." -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Копируем собранные файлы в папку static
Write-Host "📁 Копируем собранные файлы в папку static..." -ForegroundColor Yellow

# Создаем папки если их нет
if (-not (Test-Path "static")) { New-Item -ItemType Directory -Name "static" -Force }
if (-not (Test-Path "static\css")) { New-Item -ItemType Directory -Name "css" -Path "static" -Force }
if (-not (Test-Path "static\js")) { New-Item -ItemType Directory -Name "js" -Path "static" -Force }
if (-not (Test-Path "static\assets")) { New-Item -ItemType Directory -Name "assets" -Path "static" -Force }

# Копируем CSS файлы
Get-ChildItem "dist" -Filter "*.css" | ForEach-Object {
    Copy-Item $_.FullName "static\css\" -Force
    Write-Host "   📄 Скопирован CSS файл: $($_.Name)" -ForegroundColor Cyan
}

# Копируем JS файлы
Get-ChildItem "dist" -Filter "*.js" | ForEach-Object {
    Copy-Item $_.FullName "static\js\" -Force
    Write-Host "   📄 Скопирован JS файл: $($_.Name)" -ForegroundColor Cyan
}

# Копируем папку assets
if (Test-Path "dist\assets") {
    Copy-Item "dist\assets\*" "static\assets\" -Recurse -Force
    Write-Host "   📁 Скопирована папка assets" -ForegroundColor Cyan
}

# Копируем другие статические файлы
$imageExtensions = @("*.ico", "*.png", "*.jpg", "*.jpeg", "*.gif", "*.svg", "*.webp")
foreach ($ext in $imageExtensions) {
    Get-ChildItem "dist" -Filter $ext | ForEach-Object {
        Copy-Item $_.FullName "static\" -Force
        Write-Host "   📄 Скопирован файл: $($_.Name)" -ForegroundColor Cyan
    }
}

# Копируем базу данных
if (Test-Path "server\db.sqlite3") {
    Copy-Item "server\db.sqlite3" "db.sqlite3" -Force
    Write-Host "   📄 Скопирована база данных" -ForegroundColor Cyan
}

# Копируем папку uploads
if (Test-Path "server\uploads") {
    if (Test-Path "uploads") { Remove-Item "uploads" -Recurse -Force }
    Copy-Item "server\uploads" "uploads" -Recurse -Force
    Write-Host "   📁 Скопирована папка uploads" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✅ Сборка завершена успешно!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Файлы для загрузки на PythonAnywhere:" -ForegroundColor Yellow
Write-Host "   - app.py" -ForegroundColor White
Write-Host "   - wsgi.py" -ForegroundColor White
Write-Host "   - config.py" -ForegroundColor White
Write-Host "   - requirements.txt" -ForegroundColor White
Write-Host "   - .python-version" -ForegroundColor White
Write-Host "   - db.sqlite3" -ForegroundColor White
Write-Host "   - папка static/" -ForegroundColor White
Write-Host "   - папка templates/" -ForegroundColor White
Write-Host "   - папка uploads/" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Инструкции по развертыванию:" -ForegroundColor Yellow
Write-Host "   1. Загрузите все файлы на PythonAnywhere" -ForegroundColor White
Write-Host "   2. Установите зависимости: pip install -r requirements.txt" -ForegroundColor White
Write-Host "   3. Настройте WSGI файл в настройках PythonAnywhere" -ForegroundColor White
Write-Host "   4. Укажите путь к wsgi.py в настройках" -ForegroundColor White
Write-Host "   5. Перезапустите веб-приложение" -ForegroundColor White
Write-Host ""
Read-Host "Нажмите Enter для выхода"
