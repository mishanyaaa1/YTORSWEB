#!/usr/bin/env python3
"""
Скрипт для сборки React приложения и подготовки к развертыванию на PythonAnywhere
"""

import os
import shutil
import subprocess
import sys

def run_command(command, description):
    """Выполняет команду и выводит результат"""
    print(f"🚀 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} завершено успешно")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка при {description.lower()}:")
        print(f"   Команда: {command}")
        print(f"   Ошибка: {e.stderr}")
        return False

def main():
    print("🔧 Начинаем сборку проекта для PythonAnywhere...")
    
    # Проверяем наличие Node.js
    if not run_command("node --version", "Проверка версии Node.js"):
        print("❌ Node.js не найден. Установите Node.js и попробуйте снова.")
        return False
    
    # Проверяем наличие npm
    if not run_command("npm --version", "Проверка версии npm"):
        print("❌ npm не найден. Установите npm и попробуйте снова.")
        return False
    
    # Устанавливаем зависимости
    if not run_command("npm install", "Установка npm зависимостей"):
        print("❌ Не удалось установить npm зависимости.")
        return False
    
    # Собираем React приложение
    if not run_command("npm run build", "Сборка React приложения"):
        print("❌ Не удалось собрать React приложение.")
        return False
    
    # Проверяем, что папка dist создана
    if not os.path.exists("dist"):
        print("❌ Папка dist не найдена после сборки.")
        return False
    
    # Копируем собранные файлы в папку static
    print("📁 Копируем собранные файлы в папку static...")
    
    # Создаем папки если их нет
    os.makedirs("static", exist_ok=True)
    os.makedirs("static/css", exist_ok=True)
    os.makedirs("static/js", exist_ok=True)
    os.makedirs("static/assets", exist_ok=True)
    
    # Копируем CSS файлы
    for file in os.listdir("dist"):
        if file.endswith(".css"):
            shutil.copy2(f"dist/{file}", f"static/css/{file}")
            print(f"   📄 Скопирован CSS файл: {file}")
    
    # Копируем JS файлы
    for file in os.listdir("dist"):
        if file.endswith(".js"):
            shutil.copy2(f"dist/{file}", f"static/js/{file}")
            print(f"   📄 Скопирован JS файл: {file}")
    
    # Копируем папку assets
    if os.path.exists("dist/assets"):
        for file in os.listdir("dist/assets"):
            src = f"dist/assets/{file}"
            dst = f"static/assets/{file}"
            if os.path.isfile(src):
                shutil.copy2(src, dst)
                print(f"   📄 Скопирован файл: assets/{file}")
    
    # Копируем другие статические файлы
    for file in os.listdir("dist"):
        if file.endswith((".ico", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp")):
            shutil.copy2(f"dist/{file}", f"static/{file}")
            print(f"   📄 Скопирован файл: {file}")
    
    # Копируем базу данных и папку uploads
    if os.path.exists("server/db.sqlite3"):
        shutil.copy2("server/db.sqlite3", "db.sqlite3")
        print("   📄 Скопирована база данных")
    
    if os.path.exists("server/uploads"):
        if os.path.exists("uploads"):
            shutil.rmtree("uploads")
        shutil.copytree("server/uploads", "uploads")
        print("   📁 Скопирована папка uploads")
    
    print("\n✅ Сборка завершена успешно!")
    print("\n📋 Файлы для загрузки на PythonAnywhere:")
    print("   - app.py")
    print("   - wsgi.py")
    print("   - config.py")
    print("   - requirements.txt")
    print("   - .python-version")
    print("   - db.sqlite3")
    print("   - папка static/")
    print("   - папка templates/")
    print("   - папка uploads/")
    
    print("\n🚀 Инструкции по развертыванию:")
    print("1. Загрузите все файлы на PythonAnywhere")
    print("2. Установите зависимости: pip install -r requirements.txt")
    print("3. Настройте WSGI файл в настройках PythonAnywhere")
    print("4. Укажите путь к wsgi.py в настройках")
    print("5. Перезапустите веб-приложение")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
