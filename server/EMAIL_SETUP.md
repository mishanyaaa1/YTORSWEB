# Настройка Email уведомлений

## Поддерживаемые почтовые сервисы

Система поддерживает следующие SMTP провайдеры:

- **Gmail** (Google) - smtp.gmail.com:587
- **Yandex** - smtp.yandex.ru:465
- **Mail.ru** - smtp.mail.ru:465
- **Outlook** (Microsoft) - smtp-mail.outlook.com:587
- **Yahoo** - smtp.mail.yahoo.com:587
- **ProtonMail** - 127.0.0.1:1025

## Шаг 1: Выбор провайдера

Откройте файл `server/smtp-config.js` и измените строку:

```javascript
const EMAIL_PROVIDER = 'gmail'; // Измените на нужный сервис
```

**Примеры:**
- `'gmail'` - для Gmail
- `'yandex'` - для Yandex
- `'mailru'` - для Mail.ru
- `'outlook'` - для Outlook
- `'yahoo'` - для Yahoo

## Шаг 2: Настройка учетных данных

В том же файле найдите секцию с вашим провайдером и замените:

```javascript
// Для Gmail:
gmail: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'ВАШ_EMAIL@gmail.com',        // Замените на ваш email
    pass: 'ВАШ_ПАРОЛЬ_ПРИЛОЖЕНИЯ'      // Замените на пароль приложения
  }
}

// Для Yandex:
yandex: {
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: 'ВАШ_EMAIL@yandex.ru',       // Замените на ваш email
    pass: 'ВАШ_ПАРОЛЬ_ПРИЛОЖЕНИЯ'     // Замените на пароль приложения
  }
}
```

## Шаг 3: Получение паролей приложения

### Gmail (Google)
1. Включите двухфакторную аутентификацию
2. Перейдите в [настройки безопасности Google](https://myaccount.google.com/security)
3. Найдите раздел "Пароли приложений"
4. Выберите "Почта" и создайте новый пароль
5. Скопируйте созданный пароль (16 символов без пробелов)

### Yandex
1. Включите двухфакторную аутентификацию
2. Перейдите в [настройки безопасности Yandex](https://passport.yandex.ru/security)
3. Найдите раздел "Пароли приложений"
4. Создайте новый пароль для "Почта"

### Mail.ru
1. Включите двухфакторную аутентификацию
2. Перейдите в настройки безопасности
3. Найдите раздел "Пароли приложений"
4. Создайте новый пароль для "Почта"

### Outlook (Microsoft)
1. Включите двухфакторную аутентификацию
2. Перейдите в [настройки безопасности Microsoft](https://account.microsoft.com/security)
3. Найдите раздел "Пароли приложений"
4. Создайте новый пароль для "Почта"

### Yahoo
1. Включите двухфакторную аутентификацию
2. Перейдите в настройки безопасности
3. Найдите раздел "Пароли приложений"
4. Создайте новый пароль для "Почта"

## Шаг 4: Перезапуск сервера

После изменения настроек перезапустите сервер:

```bash
cd server
node index.js
```

## Шаг 5: Тестирование

1. Откройте админку в браузере
2. Перейдите в раздел "Email уведомления"
3. Убедитесь, что email получателя установлен: `i.am31827@gmail.com`
4. Нажмите кнопку "Тест"

## Возможные проблемы

- **"Invalid login"** - проверьте email и пароль приложения
- **"Less secure app access"** - используйте пароль приложения, а не обычный пароль
- **"Connection timeout"** - проверьте интернет соединение и настройки файрвола
- **"Authentication failed"** - убедитесь, что включена двухфакторная аутентификация

## Быстрая настройка

Для быстрого тестирования можно использовать готовые настройки:

```javascript
// Gmail (самый простой вариант)
const EMAIL_PROVIDER = 'gmail';
user: 'test@gmail.com',
pass: 'abcd efgh ijkl mnop'

// Yandex (для российских пользователей)
const EMAIL_PROVIDER = 'yandex';
user: 'test@yandex.ru',
pass: 'abcd efgh ijkl mnop'
```

## Альтернативные провайдеры

Если нужен другой SMTP сервер, добавьте его в `SMTP_CONFIGS`:

```javascript
custom: {
  host: 'smtp.your-server.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@domain.com',
    pass: 'your-password'
  }
}
```
