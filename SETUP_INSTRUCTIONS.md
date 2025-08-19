# Инструкции по установке и подготовке проекта

## 🔧 Установка необходимых инструментов

### 1. Установка Node.js

1. Скачайте Node.js с официального сайта: https://nodejs.org/
2. Выберите LTS версию (рекомендуется)
3. Установите Node.js, следуя инструкциям установщика
4. Перезапустите командную строку/PowerShell
5. Проверьте установку:
   ```bash
   node --version
   npm --version
   ```

### 2. Установка Python (если не установлен)

1. Скачайте Python с официального сайта: https://www.python.org/
2. Выберите версию 3.10 или выше
3. При установке обязательно отметьте "Add Python to PATH"
4. Перезапустите командную строку/PowerShell
5. Проверьте установку:
   ```bash
   python --version
   pip --version
   ```

## 🚀 Подготовка проекта к развертыванию

### Вариант 1: Автоматическая сборка (рекомендуется)

После установки Node.js и Python запустите:

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File build_for_pythonanywhere.ps1
```

**Windows (Command Prompt):**
```cmd
build_for_pythonanywhere.bat
```

**Linux/Mac:**
```bash
python build_and_deploy.py
```

### Вариант 2: Ручная сборка

1. **Установка npm зависимостей:**
   ```bash
   npm install
   ```

2. **Сборка React приложения:**
   ```bash
   npm run build
   ```

3. **Создание папок для Flask:**
   ```bash
   mkdir static
   mkdir static/css
   mkdir static/js
   mkdir static/assets
   mkdir templates
   mkdir uploads
   ```

4. **Копирование собранных файлов:**
   ```bash
   # CSS файлы
   copy dist\*.css static\css\
   
   # JS файлы
   copy dist\*.js static\js\
   
   # Папка assets
   xcopy dist\assets\* static\assets\ /E /I /Y
   
   # Другие файлы
   copy dist\*.ico static\
   copy dist\*.png static\
   copy dist\*.jpg static\
   copy dist\*.svg static\
   ```

5. **Копирование базы данных и uploads:**
   ```bash
   copy server\db.sqlite3 db.sqlite3
   xcopy server\uploads\* uploads\ /E /I /Y
   ```

## 📋 Файлы для загрузки на PythonAnywhere

После сборки у вас должны быть следующие файлы:

```
├── app.py                 # Основное Flask приложение
├── wsgi.py               # WSGI файл для PythonAnywhere
├── config.py             # Конфигурация Flask
├── requirements.txt      # Python зависимости
├── .python-version      # Версия Python
├── db.sqlite3           # База данных
├── static/              # Статические файлы (CSS, JS, изображения)
│   ├── css/
│   ├── js/
│   └── assets/
├── templates/           # HTML шаблоны
│   └── index.html
└── uploads/             # Загруженные изображения
```

## 🌐 Развертывание на PythonAnywhere

### 1. Создание аккаунта
- Перейдите на [PythonAnywhere](https://www.pythonanywhere.com/)
- Зарегистрируйтесь и создайте аккаунт

### 2. Загрузка файлов
- В панели управления перейдите в раздел "Files"
- Создайте папку для проекта (например, `ytorsweb`)
- Загрузите все подготовленные файлы

### 3. Установка зависимостей
- Перейдите в раздел "Consoles" → "Bash"
- Выполните: `pip install -r requirements.txt`

### 4. Настройка веб-приложения
- Перейдите в раздел "Web"
- Создайте новое веб-приложение с "Manual configuration"
- Выберите Python 3.10
- Укажите путь к `wsgi.py`

### 5. Настройка статических файлов
- В разделе "Static files" добавьте:
  - URL: `/static/`
  - Directory: `/home/yourusername/ytorsweb/static`

### 6. Перезапуск
- Нажмите "Reload" для перезапуска приложения

## 🐛 Решение проблем

### Node.js не найден
- Убедитесь, что Node.js установлен
- Проверьте, добавлен ли Node.js в PATH
- Перезапустите командную строку после установки

### npm команды не работают
- Переустановите Node.js
- Проверьте права доступа к папке проекта

### Ошибки при сборке
- Удалите папку `node_modules` и выполните `npm install` заново
- Проверьте версию Node.js (рекомендуется LTS)

### Проблемы с Python
- Убедитесь, что Python добавлен в PATH
- Проверьте версию Python (должна быть 3.10+)

## 📞 Поддержка

Если у вас возникли проблемы:

1. Проверьте логи ошибок
2. Убедитесь, что все инструменты установлены корректно
3. Проверьте права доступа к файлам
4. Обратитесь к документации установленных инструментов

## 🎯 Следующие шаги

После успешной сборки:

1. Загрузите файлы на PythonAnywhere
2. Следуйте инструкциям по развертыванию
3. Проверьте работу сайта
4. Настройте домен (если нужно)

Удачи с развертыванием! 🚀
