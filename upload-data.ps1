# PowerShell скрипт для загрузки данных на сервер
$data = Get-Content -Path "server/exported-data.json" -Raw
$uri = "https://ytorsweb-backend.onrender.com/api/upload-data"

try {
    Write-Host "🚀 Загружаем данные на сервер..." -ForegroundColor Green
    
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $data -ContentType "application/json"
    
    Write-Host "✅ Данные успешно загружены!" -ForegroundColor Green
    Write-Host "📊 Результаты:" -ForegroundColor Yellow
    
    foreach ($result in $response.results) {
        Write-Host "   $result" -ForegroundColor Cyan
    }
    
    Write-Host "`n🎉 Миграция завершена! Теперь все данные доступны на сайте." -ForegroundColor Green
    
} catch {
    Write-Host "❌ Ошибка при загрузке данных:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
