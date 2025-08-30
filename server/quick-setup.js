const fs = require('fs');
const path = require('path');

// Быстрая настройка SMTP провайдера
console.log('🚀 Быстрая настройка SMTP провайдера');
console.log('=' .repeat(40));

// Доступные провайдеры
const providers = {
  '1': { name: 'Gmail', key: 'gmail', desc: 'Google Mail (рекомендуется)' },
  '2': { name: 'Yandex', key: 'yandex', desc: 'Яндекс.Почта (для России)' },
  '3': { name: 'Mail.ru', key: 'mailru', desc: 'Mail.ru (для России)' },
  '4': { name: 'Outlook', key: 'outlook', desc: 'Microsoft Outlook' },
  '5': { name: 'Yahoo', key: 'yahoo', desc: 'Yahoo Mail' }
};

// Показываем меню
console.log('Выберите ваш почтовый сервис:');
Object.entries(providers).forEach(([key, provider]) => {
  console.log(`  ${key}. ${provider.name} - ${provider.desc}`);
});

console.log('\nДля выхода нажмите Ctrl+C');

// Читаем ввод пользователя
process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
  const choice = data.trim();
  
  if (providers[choice]) {
    const provider = providers[choice];
    console.log(`\n✅ Выбран: ${provider.name}`);
    
    // Запрашиваем email
    console.log('\n📧 Введите ваш email:');
    process.stdin.once('data', (emailData) => {
      const email = emailData.trim();
      
      // Запрашиваем пароль
      console.log('🔐 Введите пароль приложения:');
      process.stdin.once('data', (passwordData) => {
        const password = passwordData.trim();
        
        // Создаем конфиг
        createConfig(provider.key, email, password);
      });
    });
  } else {
    console.log('❌ Неверный выбор. Попробуйте снова.');
  }
});

function createConfig(providerKey, email, password) {
  const configPath = path.join(__dirname, 'smtp-config.js');
  
  // Читаем текущий файл
  let content = fs.readFileSync(configPath, 'utf8');
  
  // Обновляем провайдер
  content = content.replace(
    /const EMAIL_PROVIDER = '[^']+';/,
    `const EMAIL_PROVIDER = '${providerKey}';`
  );
  
  // Обновляем email и пароль для выбранного провайдера
  const providerConfigs = {
    gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
    yandex: { host: 'smtp.yandex.ru', port: 465, secure: true },
    mailru: { host: 'smtp.mail.ru', port: 465, secure: true },
    outlook: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
    yahoo: { host: 'smtp.mail.yahoo.com', port: 587, secure: false }
  };
  
  const config = providerConfigs[providerKey];
  
  // Обновляем настройки провайдера
  const providerSection = `  ${providerKey}: {
    host: '${config.host}',
    port: ${config.port},
    secure: ${config.secure},
    auth: {
      user: '${email}',
      pass: '${password}'
    }
  }`;
  
  // Находим и заменяем секцию провайдера
  const regex = new RegExp(`  ${providerKey}: \\{[^}]+\\}`, 's');
  content = content.replace(regex, providerSection);
  
  // Записываем обновленный файл
  fs.writeFileSync(configPath, content, 'utf8');
  
  console.log('\n✅ Конфигурация обновлена!');
  console.log(`📝 Файл: ${configPath}`);
  console.log(`🔧 Провайдер: ${providerKey}`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔐 Пароль: ${'*'.repeat(password.length)}`);
  
  console.log('\n🚀 Теперь перезапустите сервер:');
  console.log('   cd server');
  console.log('   node index.js');
  
  console.log('\n🧪 Или протестируйте настройки:');
  console.log('   node test-smtp.js');
  
  process.exit(0);
}

// Обработка выхода
process.on('SIGINT', () => {
  console.log('\n👋 До свидания!');
  process.exit(0);
});
