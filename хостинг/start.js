#!/usr/bin/env node

/**
 * Скрипт запуска для shared хостингов
 * Используется когда нет доступа к PM2 или systemd
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Создание необходимых директорий
const dirs = ['logs', 'uploads', 'database'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Настройка логирования
const logFile = path.join(__dirname, 'logs', 'app.log');
const errorLogFile = path.join(__dirname, 'logs', 'error.log');

// Создание write streams для логов
const logStream = fs.createWriteStream(logFile, { flags: 'a' });
const errorStream = fs.createWriteStream(errorLogFile, { flags: 'a' });

// Функция логирования
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    logStream.write(logMessage);
    process.stdout.write(logMessage);
}

function errorLog(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}\n`;
    errorStream.write(logMessage);
    process.stderr.write(logMessage);
}

// Обработка сигналов завершения
process.on('SIGINT', () => {
    log('Получен сигнал SIGINT, завершение работы...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    log('Получен сигнал SIGTERM, завершение работы...');
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    errorLog(`Необработанное исключение: ${err.message}`);
    errorLog(err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    errorLog(`Необработанное отклонение промиса: ${reason}`);
    process.exit(1);
});

// Запуск сервера
log('Запуск YTORSWEB сервера...');

const server = spawn('node', ['server/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: __dirname
});

// Перенаправление stdout и stderr
server.stdout.pipe(logStream);
server.stdout.pipe(process.stdout);
server.stderr.pipe(errorStream);
server.stderr.pipe(process.stderr);

// Обработка событий сервера
server.on('error', (err) => {
    errorLog(`Ошибка запуска сервера: ${err.message}`);
    process.exit(1);
});

server.on('exit', (code) => {
    if (code === 0) {
        log('Сервер завершил работу успешно');
    } else {
        errorLog(`Сервер завершил работу с кодом: ${code}`);
    }
    process.exit(code);
});

// Проверка здоровья сервера каждые 30 секунд
setInterval(() => {
    if (server.killed) {
        errorLog('Сервер не отвечает, перезапуск...');
        server.kill();
        process.exit(1);
    }
}, 30000);

log('Сервер запущен и работает');
