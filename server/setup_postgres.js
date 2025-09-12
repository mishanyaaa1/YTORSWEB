const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Настройка PostgreSQL для проекта YTORSWEB...\n');

// Проверяем, установлен ли PostgreSQL
try {
  execSync('psql --version', { stdio: 'pipe' });
  console.log('✓ PostgreSQL уже установлен');
} catch (error) {
  console.log('✗ PostgreSQL не найден. Установите PostgreSQL:');
  console.log('  Windows: https://www.postgresql.org/download/windows/');
  console.log('  macOS: brew install postgresql');
  console.log('  Ubuntu: sudo apt-get install postgresql postgresql-contrib');
  process.exit(1);
}

// Устанавливаем pg модуль если не установлен
try {
  require.resolve('pg');
  console.log('✓ pg модуль уже установлен');
} catch (error) {
  console.log('Устанавливаем pg модуль...');
  try {
    execSync('npm install pg', { stdio: 'inherit' });
    console.log('✓ pg модуль установлен');
  } catch (installError) {
    console.error('✗ Ошибка при установке pg модуля:', installError.message);
    process.exit(1);
  }
}

// Создаем файл с переменными окружения
const envContent = `# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_DB=ytorsweb
POSTGRES_PASSWORD=password
POSTGRES_PORT=5432
`;

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✓ Создан файл .env с настройками PostgreSQL');
} else {
  console.log('✓ Файл .env уже существует');
}

console.log('\n📋 Следующие шаги:');
console.log('1. Создайте базу данных PostgreSQL:');
console.log('   createdb ytorsweb');
console.log('2. Или через psql:');
console.log('   psql -U postgres');
console.log('   CREATE DATABASE ytorsweb;');
console.log('   \\q');
console.log('3. Запустите создание схемы:');
console.log('   psql -U postgres -d ytorsweb -f postgres_schema.sql');
console.log('4. Запустите инициализацию данных:');
console.log('   psql -U postgres -d ytorsweb -f postgres_init_data.sql');
console.log('5. Запустите миграцию данных:');
console.log('   node migrate_to_postgres.js');
console.log('\n⚠️  Убедитесь, что настройки в .env соответствуют вашей конфигурации PostgreSQL!');
