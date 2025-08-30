const nodemailer = require('nodemailer');
const SMTP_CONFIG = require('./smtp-config');

console.log('🧪 Тестирую SMTP соединение...');
console.log('📧 Host:', SMTP_CONFIG.host);
console.log('🔒 Port:', SMTP_CONFIG.port);
console.log('👤 User:', SMTP_CONFIG.auth.user);

async function testSMTP() {
  try {
    const transporter = nodemailer.createTransporter(SMTP_CONFIG);
    
    console.log('🔍 Проверяю соединение...');
    await transporter.verify();
    console.log('✅ Соединение успешно!');
    
    console.log('📤 Отправляю тестовое письмо...');
    const info = await transporter.sendMail({
      from: SMTP_CONFIG.auth.user,
      to: 'i.am31827@gmail.com',
      subject: 'Тест SMTP',
      text: 'Это тестовое письмо.'
    });
    
    console.log('✅ Письмо отправлено!');
    console.log('📨 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Проблема с аутентификацией. Проверьте email и пароль.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Проблема с соединением. Проверьте интернет.');
    }
  }
}

testSMTP();
