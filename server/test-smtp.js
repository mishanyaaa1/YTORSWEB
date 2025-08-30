const nodemailer = require('nodemailer');
const SMTP_CONFIG = require('./smtp-config');

async function testSMTP() {
  console.log('Тестирую SMTP соединение...');
  console.log('Настройки:', {
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure,
    user: SMTP_CONFIG.auth.user
  });
  
  try {
    // Создаем транспортер
    const transporter = nodemailer.createTransporter(SMTP_CONFIG);
    
    // Проверяем соединение
    console.log('Проверяю соединение...');
    await transporter.verify();
    console.log('✅ SMTP соединение успешно!');
    
    // Отправляем тестовое письмо
    console.log('Отправляю тестовое письмо...');
    const info = await transporter.sendMail({
      from: SMTP_CONFIG.auth.user,
      to: 'i.am31827@gmail.com',
      subject: 'Тест SMTP соединения',
      text: 'Это тестовое письмо для проверки SMTP настроек.',
      html: '<p>Это тестовое письмо для проверки SMTP настроек.</p>'
    });
    
    console.log('✅ Тестовое письмо отправлено!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Ошибка SMTP:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('Проблема с аутентификацией. Проверьте email и пароль приложения.');
    } else if (error.code === 'ECONNECTION') {
      console.error('Проблема с соединением. Проверьте интернет и настройки файрвола.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Таймаут соединения. Проверьте настройки SMTP.');
    }
    
    console.error('Полная ошибка:', error);
  }
}

testSMTP();
