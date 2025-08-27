#!/bin/bash

# Скрипт автоматического развертывания YTORSWEB
# Использование: ./deploy.sh [production|staging]

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

# Проверка аргументов
ENVIRONMENT=${1:-production}
if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "staging" ]]; then
    log_error "Неверное окружение. Используйте 'production' или 'staging'"
    exit 1
fi

log_info "Начинаем развертывание в окружении: $ENVIRONMENT"

# Проверка зависимостей
check_dependencies() {
    log_info "Проверяем зависимости..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js не установлен"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm не установлен"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Требуется Node.js версии 18 или выше. Текущая версия: $(node --version)"
        exit 1
    fi
    
    log_success "Зависимости проверены"
}

# Создание необходимых директорий
create_directories() {
    log_info "Создаем необходимые директории..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p database
    mkdir -p ssl
    
    log_success "Директории созданы"
}

# Установка зависимостей
install_dependencies() {
    log_info "Устанавливаем зависимости..."
    
    npm ci --only=production
    cd server && npm ci --only=production && cd ..
    
    log_success "Зависимости установлены"
}

# Настройка базы данных
setup_database() {
    log_info "Настраиваем базу данных..."
    
    cd server
    
    if [ -f "migrate.js" ]; then
        node migrate.js
        log_success "Миграции выполнены"
    fi
    
    if [ -f "seed/seed.js" ]; then
        node seed/seed.js
        log_success "База данных заполнена начальными данными"
    fi
    
    cd ..
}

# Сборка фронтенда
build_frontend() {
    log_info "Собираем фронтенд..."
    
    npm run build
    
    log_success "Фронтенд собран"
}

# Настройка переменных окружения
setup_environment() {
    log_info "Настраиваем переменные окружения..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            log_warning "Создан файл .env из примера. Отредактируйте его для продакшена!"
        else
            log_warning "Файл .env не найден. Создайте его вручную."
        fi
    fi
    
    log_success "Переменные окружения настроены"
}

# Настройка PM2 (если доступен)
setup_pm2() {
    if command -v pm2 &> /dev/null; then
        log_info "Настраиваем PM2..."
        
        if [ -f "ecosystem.config.js" ]; then
            pm2 start ecosystem.config.js --env $ENVIRONMENT
            pm2 save
            pm2 startup
            log_success "PM2 настроен и запущен"
        fi
    else
        log_warning "PM2 не установлен. Используйте 'npm start' для запуска"
    fi
}

# Проверка здоровья приложения
health_check() {
    log_info "Проверяем здоровье приложения..."
    
    # Ждем запуска сервера
    sleep 5
    
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log_success "Приложение работает корректно"
    else
        log_warning "Приложение не отвечает на health check"
    fi
}

# Основная функция развертывания
main() {
    log_info "=== Начинаем развертывание YTORSWEB ==="
    
    check_dependencies
    create_directories
    install_dependencies
    setup_database
    build_frontend
    setup_environment
    setup_pm2
    health_check
    
    log_success "=== Развертывание завершено успешно! ==="
    log_info "Приложение доступно по адресу: http://localhost:3000"
    
    if command -v pm2 &> /dev/null; then
        log_info "Управление через PM2:"
        log_info "  pm2 status          - статус процессов"
        log_info "  pm2 logs            - просмотр логов"
        log_info "  pm2 monit           - мониторинг"
        log_info "  pm2 restart all     - перезапуск"
    fi
}

# Обработка ошибок
trap 'log_error "Развертывание прервано из-за ошибки"; exit 1' ERR

# Запуск основного процесса
main "$@"
