const nodemailer = require('nodemailer');
const SMTP_CONFIG = require('./smtp-config');

console.log('🧪 Тестирую Yandex SMTP...');
console.log('📧 Host:', SMTP_CONFIG.host);
console.log('🔒 Port:', SMTP_CONFIG.port);
console.log('👤 User:', SMTP_CONFIG.auth.user);

async function testYandex() {
  try {
    const transporter = nodemailer.createTransporter(SMTP_CONFIG);
    
    console.log('🔍 Проверяю соединение с Yandex...');
    await transporter.verify();
    console.log('✅ Соединение с Yandex успешно!');
    
    console.log('📤 Отправляю тестовое письмо...');
    const info = await transporter.sendMail({
      from: SMTP_CONFIG.auth.user,
      to: 'i.am31827@gmail.com',
      subject: 'Тест Yandex SMTP',
      text: 'Это тестовое письмо от Yandex SMTP.',
      html: '<h2>Тест Yandex SMTP</h2><p>Это тестовое письмо от <strong>Yandex SMTP</strong>.</p>'
    });
    
    console.log('✅ Письмо отправлено через Yandex!');
    console.log('📨 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Ошибка Yandex SMTP:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Проблема с аутентификацией. Проверьте email и пароль.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Проблема с соединением. Проверьте интернет.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Таймаут соединения.');
    }
  }
}

testYandex();
