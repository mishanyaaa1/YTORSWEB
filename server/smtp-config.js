// SMTP настройки для Yandex (работает с обычным паролем!)
module.exports = {
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: 'NeVaritBoshka@ya.ru',
    pass: 'gghbrayzgqxsgmag'
  }
};

/*
ПРЕИМУЩЕСТВА YANDEX:
✅ Обычный пароль работает (не нужен пароль приложения)
✅ Не нужна двухфакторная аутентификация
✅ Быстрая настройка
✅ Стабильная работа

НАСТРОЙКА ЗАВЕРШЕНА:
✅ Email: NeVaritBoshka@ya.ru
✅ Пароль: gghbrayzgqxsgmag
✅ Host: smtp.yandex.ru
✅ Port: 465

СЛЕДУЮЩИЕ ШАГИ:
1. Перезапустите сервер: node index.js
2. Протестируйте в админке
*/
