# Инструкция по настройке сайта на Tilda

## 📋 Что включено в HTML-код

Созданный HTML-код содержит:

### 🎨 **Стили и дизайн**
- Полная цветовая схема вашего сайта (темная тема с золотыми акцентами)
- Адаптивный дизайн для всех устройств
- Анимации и переходы
- Стили для всех компонентов (каталог, корзина, админ-панель)

### ⚛️ **React и зависимости**
- React 19.1.1
- React Router для навигации
- Framer Motion для анимаций
- React Icons для иконок
- Styled Components для стилизации

### 🔧 **Функциональность**
- Система тем (темная/светлая)
- Мобильное меню
- Уведомления (toast)
- Адаптивная сетка
- Формы и таблицы

## 🚀 Как использовать на Tilda

### 1. **Вставка HTML-кода**
1. Откройте настройки страницы в Tilda
2. Перейдите в раздел "HTML-код"
3. Вставьте весь код из файла `tilda_head_code.html` в поле "HTML-код в `<head>`"

### 2. **Настройка мета-тегов**
Замените пустые значения в коде на ваши:
```html
<meta property="og:url" content="https://ваш-сайт.ru">
<meta property="og:image" content="https://ваш-сайт.ru/og-image.jpg">
<link rel="canonical" href="https://ваш-сайт.ru">
```

### 3. **Загрузка изображений**
- Загрузите логотип и favicon в Tilda
- Обновите пути к изображениям в коде

## 🎯 Основные компоненты для использования

### **Навигация**
```html
<header class="header">
  <div class="container">
    <div class="header-content">
      <div class="logo">
        <!-- Ваш логотип -->
      </div>
      <nav class="nav">
        <a href="#" class="nav-link">Главная</a>
        <a href="#" class="nav-link">Каталог</a>
        <a href="#" class="nav-link">О нас</a>
        <a href="#" class="nav-link">Контакты</a>
      </nav>
      <div class="header-actions">
        <button class="icon-button" onclick="toggleMobileMenu()">☰</button>
        <button class="icon-button" onclick="toggleTheme()">🌙</button>
      </div>
    </div>
  </div>
</header>
```

### **Каталог товаров**
```html
<div class="catalog-grid">
  <div class="product-card">
    <img src="product-image.jpg" alt="Товар" class="product-image">
    <div class="product-info">
      <h3 class="product-title">Название товара</h3>
      <div class="product-price">₽ 15,000</div>
      <button class="btn-primary">В корзину</button>
    </div>
  </div>
</div>
```

### **Кнопки**
```html
<button class="btn-primary">Основная кнопка</button>
<button class="action-btn btn-edit">Редактировать</button>
<button class="action-btn btn-delete">Удалить</button>
```

### **Формы**
```html
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="form-input" placeholder="Введите email">
</div>
```

## 🎨 Цветовая схема

Основные цвета определены в CSS-переменных:
```css
:root {
  --primary-color: #e6a34a;      /* Золотой */
  --primary-dark: #d8943a;       /* Темно-золотой */
  --background-dark: #0a0a0a;    /* Черный фон */
  --text-primary: #ffffff;       /* Белый текст */
  --border-color: rgba(255, 255, 255, 0.1); /* Границы */
}
```

## 📱 Адаптивность

Сайт автоматически адаптируется под все устройства:
- **Desktop**: Полная версия с боковой навигацией
- **Tablet**: Компактная версия
- **Mobile**: Мобильное меню с гамбургером

## ⚡ JavaScript функции

Доступные глобальные функции:
```javascript
// Переключение темы
toggleTheme()

// Показ уведомлений
showToast('Сообщение', 'success', 3000)

// Мобильное меню
toggleMobileMenu()
```

## 🔧 Дополнительные настройки

### **SEO оптимизация**
- Мета-теги для поисковых систем
- Open Graph для социальных сетей
- Структурированные данные (Schema.org)

### **Производительность**
- Preload критических ресурсов
- DNS prefetch для внешних доменов
- Оптимизированные шрифты

### **PWA поддержка**
- Manifest файл
- Иконки для различных устройств
- Apple Touch Icon

## 📝 Важные замечания

1. **React приложение**: Код загружает React, но для полноценной работы нужно создать компоненты
2. **Роутинг**: React Router загружен, но маршруты нужно настроить отдельно
3. **Данные**: Для работы с данными нужно подключить API или базу данных
4. **Изображения**: Замените все пути к изображениям на реальные

## 🚀 Следующие шаги

После вставки HTML-кода:

1. **Создайте страницы** в Tilda с нужной структурой
2. **Добавьте контент** (тексты, изображения, товары)
3. **Настройте навигацию** между страницами
4. **Протестируйте** на разных устройствах
5. **Настройте аналитику** (Google Analytics, Яндекс.Метрика)

## 🆘 Поддержка

Если возникнут вопросы:
1. Проверьте консоль браузера на ошибки
2. Убедитесь, что все зависимости загрузились
3. Проверьте, что HTML-код вставлен в правильное место

---

**Удачи с вашим сайтом на Tilda! 🎉**
