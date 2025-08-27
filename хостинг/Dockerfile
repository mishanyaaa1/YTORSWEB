# Многоэтапная сборка для оптимизации размера
FROM node:18-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование package файлов
COPY package*.json ./
COPY server/package*.json ./server/

# Установка зависимостей
RUN npm ci --only=production
RUN cd server && npm ci --only=production

# Копирование исходного кода
COPY . .

# Сборка фронтенда
RUN npm run build

# Продакшн образ
FROM node:18-alpine AS production

# Установка необходимых пакетов
RUN apk add --no-cache dumb-init

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Установка рабочей директории
WORKDIR /app

# Копирование package файлов
COPY package*.json ./
COPY server/package*.json ./server/

# Установка только продакшн зависимостей
RUN npm ci --only=production && npm cache clean --force
RUN cd server && npm ci --only=production && npm cache clean --force

# Копирование собранного фронтенда
COPY --from=builder /app/dist ./dist

# Копирование серверного кода
COPY server/ ./server/

# Создание необходимых директорий
RUN mkdir -p logs uploads database

# Установка прав доступа
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открытие порта
EXPOSE 3000

# Использование dumb-init для корректной обработки сигналов
ENTRYPOINT ["dumb-init", "--"]

# Запуск приложения
CMD ["node", "server/index.js"]
