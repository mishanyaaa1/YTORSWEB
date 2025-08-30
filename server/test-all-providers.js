const nodemailer = require('nodemailer');

// Тестовые настройки для всех провайдеров
const TEST_CONFIGS = {
  gmail: {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@gmail.com', // ЗАМЕНИТЕ НА ВАШ EMAIL
      pass: 'your-app-password' // ЗАМЕНИТЕ НА ВАШ ПАРОЛЬ
    }
  },
  yandex: {
    name: 'Yandex',
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: 'test@yandex.ru', // ЗАМЕНИТЕ НА ВАШ EMAIL
      pass: 'your-app-password' // ЗАМЕНИТЕ НА ВАШ ПАРОЛЬ
    }
  },
  mailru: {
    name: 'Mail.ru',
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
      user: 'test@mail.ru', // ЗАМЕНИТЕ НА ВАШ EMAIL
      pass: 'your-app-password' // ЗАМЕНИТЕ НА ВАШ ПАРОЛЬ
    }
  },
  outlook: {
    name: 'Outlook',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@outlook.com', // ЗАМЕНИТЕ НА ВАШ EMAIL
      pass: 'your-app-password' // ЗАМЕНИТЕ НА ВАШ ПАРОЛЬ
    }
  },
  yahoo: {
    name: 'Yahoo',
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@yahoo.com', // ЗАМЕНИТЕ НА ВАШ EMAIL
      pass: 'your-app-password' // ЗАМЕНИТЕ НА ВАШ ПАРОЛЬ
    }
  }
};

async function testProvider(providerName, config) {
  console.log(`\n🧪 Тестирую ${providerName}...`);
  console.log(`📧 Host: ${config.host}:${config.port}`);
  console.log(`🔒 Secure: ${config.secure}`);
  console.log(`👤 User: ${config.auth.user}`);
  
  try {
    // Создаем транспортер
    const transporter = nodemailer.createTransporter(config);
    
    // Проверяем соединение
    console.log('🔍 Проверяю соединение...');
    await transporter.verify();
    console.log('✅ Соединение успешно!');
    
    // Отправляем тестовое письмо
    console.log('📤 Отправляю тестовое письмо...');
    const info = await transporter.sendMail({
      from: config.auth.user,
      to: 'i.am31827@gmail.com',
      subject: `Тест ${providerName} - ${new Date().toLocaleString()}`,
      text: `Это тестовое письмо от ${providerName}.\n\nВремя отправки: ${new Date().toLocaleString('ru-RU')}\n\nЕсли вы получили это письмо, значит ${providerName} работает корректно!`,
      html: `<h2>Тест ${providerName}</h2><p>Это тестовое письмо от <strong>${providerName}</strong>.</p><p><strong>Время отправки:</strong> ${new Date().toLocaleString('ru-RU')}</p><p>Если вы получили это письмо, значит <strong>${providerName}</strong> работает корректно!</p>`
    });
    
    console.log(`✅ ${providerName} - письмо отправлено!`);
    console.log(`📨 Message ID: ${info.messageId}`);
    return { success: true, provider: providerName, messageId: info.messageId };
    
  } catch (error) {
    console.error(`❌ ${providerName} - ошибка:`, error.message);
    
    // Детальная диагностика ошибок
    if (error.code === 'EAUTH') {
      console.error(`   🔐 Проблема с аутентификацией. Проверьте email и пароль приложения.`);
    } else if (error.code === 'ECONNECTION') {
      console.error(`   🌐 Проблема с соединением. Проверьте интернет и настройки файрвола.`);
    } else if (error.code === 'ETIMEDOUT') {
      console.error(`   ⏰ Таймаут соединения. Проверьте настройки SMTP.`);
    } else if (error.code === 'ENOTFOUND') {
      console.error(`   🔍 Сервер не найден. Проверьте правильность host.`);
    }
    
    return { success: false, provider: providerName, error: error.message };
  }
}

async function testAllProviders() {
  console.log('🚀 Тестирование всех SMTP провайдеров');
  console.log('=' .repeat(50));
  
  const results = [];
  
  for (const [key, config] of Object.entries(TEST_CONFIGS)) {
    const result = await testProvider(config.name, config);
    results.push(result);
    
    // Пауза между тестами
    if (key !== Object.keys(TEST_CONFIGS).pop()) {
      console.log('⏳ Жду 2 секунды перед следующим тестом...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Итоговый отчет
  console.log('\n' + '=' .repeat(50));
  console.log('📊 ИТОГОВЫЙ ОТЧЕТ');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Успешно: ${successful.length}`);
  successful.forEach(r => {
    console.log(`   • ${r.provider} - ${r.messageId}`);
  });
  
  console.log(`❌ Ошибки: ${failed.length}`);
  failed.forEach(r => {
    console.log(`   • ${r.provider} - ${r.error}`);
  });
  
  if (successful.length > 0) {
    console.log('\n🎉 Рекомендация: используйте любой из успешных провайдеров!');
    console.log('📝 Скопируйте настройки в server/smtp-config.js');
  } else {
    console.log('\n⚠️  Все провайдеры не работают. Проверьте:');
    console.log('   • Интернет соединение');
    console.log('   • Настройки файрвола');
    console.log('   • Правильность email и паролей');
  }
}

// Запуск тестирования
testAllProviders().catch(console.error);
