#!/bin/bash

# Скрипт установки YTORSWEB для Linux/Mac
# Использование: ./install.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции логирования
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "========================================"
echo "    Установка YTORSWEB на хостинг"
echo "========================================"
echo

# Проверка зависимостей
log_info "Проверка зависимостей..."

if ! command -v node &> /dev/null; then
    log_error "Node.js не установлен!"
    echo "Установите Node.js:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  CentOS/RHEL: sudo yum install nodejs npm"
    echo "  macOS: brew install node"
    echo "  Или скачайте с https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm не установлен!"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Требуется Node.js версии 18 или выше. Текущая версия: $(node --version)"
    exit 1
fi

log_success "Node.js $(node --version) и npm $(npm --version) найдены"
echo

# Создание директорий
log_info "Создание директорий..."
mkdir -p logs uploads database ssl
log_success "Директории созданы"
echo

# Установка зависимостей
log_info "Установка зависимостей..."
npm install
if [ $? -ne 0 ]; then
    log_error "Не удалось установить зависимости!"
    exit 1
fi

cd server
npm install
if [ $? -ne 0 ]; then
    log_error "Не удалось установить зависимости сервера!"
    exit 1
fi
cd ..
log_success "Зависимости установлены"
echo

# Сборка фронтенда
log_info "Сборка фронтенда..."
npm run build
if [ $? -ne 0 ]; then
    log_error "Не удалось собрать фронтенд!"
    exit 1
fi
log_success "Фронтенд собран"
echo

# Настройка переменных окружения
log_info "Настройка переменных окружения..."
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        log_warning "Создан файл .env из примера"
        echo "Отредактируйте его для продакшена!"
    else
        log_warning "Создайте файл .env вручную"
    fi
fi
log_success "Переменные окружения настроены"
echo

# Настройка базы данных
log_info "Настройка базы данных..."
cd server

if [ -f "migrate.js" ]; then
    node migrate.js
    if [ $? -eq 0 ]; then
        log_success "Миграции выполнены"
    else
        log_warning "Ошибка выполнения миграций"
    fi
fi

if [ -f "seed/seed.js" ]; then
    node seed/seed.js
    if [ $? -eq 0 ]; then
        log_success "База данных заполнена"
    else
        log_warning "Ошибка заполнения базы данных"
    fi
fi

cd ..
echo

# Установка PM2 (опционально)
log_info "Установка PM2 (опционально)..."
if ! command -v pm2 &> /dev/null; then
    echo "PM2 не установлен. Установить? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        npm install -g pm2
        log_success "PM2 установлен"
    else
        log_warning "PM2 не установлен. Используйте 'npm start' для запуска"
    fi
else
    log_success "PM2 уже установлен"
fi
echo

# Настройка автозапуска (для systemd)
if command -v systemctl &> /dev/null; then
    log_info "Настройка автозапуска через systemd..."
    if [ -f "ecosystem.config.js" ]; then
        echo "Создать systemd сервис для автозапуска? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            sudo tee /etc/systemd/system/ytorsweb.service > /dev/null <<EOF
[Unit]
Description=YTORSWEB Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
            sudo systemctl daemon-reload
            sudo systemctl enable ytorsweb.service
            log_success "Systemd сервис создан и включен"
        fi
    fi
fi

echo "========================================"
echo "    Установка завершена успешно!"
echo "========================================"
echo
echo "Для запуска используйте:"
echo "  npm start"
echo
echo "Или для разработки:"
echo "  npm run dev"
echo
if command -v pm2 &> /dev/null; then
    echo "Для продакшена с PM2:"
    echo "  pm2 start ecosystem.config.js"
    echo "  pm2 save"
    echo "  pm2 startup"
fi
echo
echo "Приложение будет доступно по адресу:"
echo "  http://localhost:3000"
echo
