# Metro Startup Script - Ensures correct directory
Set-Location 'd:\safemate-mobile-android'
Write-Host "🚀 Starting Metro from: $(Get-Location)" -ForegroundColor Green
Write-Host "📁 Directory contents:" -ForegroundColor Cyan
Get-ChildItem -Name package.json, index.js, src
Write-Host "🌐 Starting Metro bundler..." -ForegroundColor Cyan
npm start
