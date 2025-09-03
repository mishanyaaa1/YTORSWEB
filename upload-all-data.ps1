# PowerShell скрипт для загрузки всех данных на сервер
$baseUrl = "https://ytorsweb-backend.onrender.com/api/upload-data"
$files = @(
    "subcategories.json",
    "brands.json", 
    "products.json",
    "productImages.json",
    "promotions.json",
    "customers.json",
    "orders.json",
    "orderItems.json",
    "orderNotes.json",
    "advertisingSettings.json",
    "botSettings.json",
    "terrainTypes.json",
    "vehicleTypes.json"
)

Write-Host "🚀 Начинаем загрузку всех данных на сервер..." -ForegroundColor Green

foreach ($file in $files) {
    if (Test-Path $file) {
        try {
            Write-Host "📤 Загружаем $file..." -ForegroundColor Yellow
            $data = Get-Content -Path $file -Raw -Encoding UTF8
            $response = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $data -ContentType "application/json; charset=utf-8"
            
            if ($response.success) {
                Write-Host "✅ $file загружен успешно!" -ForegroundColor Green
                foreach ($result in $response.results) {
                    Write-Host "   $result" -ForegroundColor Cyan
                }
            } else {
                Write-Host "❌ Ошибка при загрузке $file" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Ошибка при загрузке $file`: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Файл $file не найден, пропускаем..." -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Загрузка данных завершена!" -ForegroundColor Green
Write-Host "Теперь все ваши данные доступны на сайте и в админке!" -ForegroundColor Green
