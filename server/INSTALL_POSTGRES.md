# Установка PostgreSQL на Windows

## Способ 1: Установка через официальный сайт

1. Перейдите на https://www.postgresql.org/download/windows/
2. Скачайте PostgreSQL для Windows
3. Запустите установщик
4. Выберите компоненты:
   - PostgreSQL Server
   - pgAdmin (графический интерфейс)
   - Command Line Tools
5. Установите пароль для пользователя postgres (запомните его!)
6. Выберите порт 5432 (по умолчанию)
7. Завершите установку

## Способ 2: Установка через Chocolatey

```powershell
# Установите Chocolatey если не установлен
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Установите PostgreSQL
choco install postgresql
```

## Способ 3: Установка через Scoop

```powershell
# Установите Scoop если не установлен
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Установите PostgreSQL
scoop install postgresql
```

## После установки

1. Откройте командную строку или PowerShell
2. Создайте базу данных:
   ```cmd
   createdb ytorsweb
   ```
   Или через psql:
   ```cmd
   psql -U postgres
   CREATE DATABASE ytorsweb;
   \q
   ```

3. Скопируйте файл `env.example` в `.env` и настройте пароль:
   ```env
   POSTGRES_PASSWORD=ваш_пароль_от_postgres
   ```

4. Запустите миграцию:
   ```cmd
   psql -U postgres -d ytorsweb -f postgres_schema.sql
   psql -U postgres -d ytorsweb -f postgres_init_data.sql
   node migrate_to_postgres.js
   ```

## Альтернатива: Docker

Если не хотите устанавливать PostgreSQL локально, можете использовать Docker:

```cmd
# Запустите PostgreSQL в Docker
docker run --name postgres-ytorsweb -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ytorsweb -p 5432:5432 -d postgres:15

# Подключитесь к базе
docker exec -it postgres-ytorsweb psql -U postgres -d ytorsweb
```
