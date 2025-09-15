#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Генерация безопасных секретов для .env файла\n');

// Генерируем JWT секрет (64 символа)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log(`JWT_SECRET=${jwtSecret}`);

// Генерируем пароль админа (32 символа)
const adminPassword = crypto.randomBytes(16).toString('hex');
console.log(`ADMIN_PASSWORD=${adminPassword}`);

// Генерируем пароль БД (32 символа)
const dbPassword = crypto.randomBytes(16).toString('hex');
console.log(`POSTGRES_PASSWORD=${dbPassword}`);

console.log('\n✅ Скопируйте эти значения в ваш .env файл');
console.log('⚠️  НЕ ДЕЛИТЕСЬ этими секретами с кем-либо!');
