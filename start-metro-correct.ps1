# Start Metro from correct directory
Set-Location "d:\safemate-mobile-android"
Write-Host "Starting Metro from: $(Get-Location)" -ForegroundColor Green
npm start
