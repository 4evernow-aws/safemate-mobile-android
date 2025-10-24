# SafeMate Android PowerShell Profile
# This ensures the correct directory is always set

Write-Host "🚀 SafeMate Android Profile Loaded" -ForegroundColor Cyan

# Set the correct directory
Set-Location "d:\safemate-mobile-android"

# Verify we're in the right place
if (Test-Path "package.json") {
    Write-Host "✅ SafeMate Android directory confirmed!" -ForegroundColor Green
    Write-Host "📁 Current directory: D:\safemate-mobile-android" -ForegroundColor White
} else {
    Write-Host "❌ Directory issue detected!" -ForegroundColor Red
    Write-Host "Please run: cd 'd:\safemate-mobile-android'" -ForegroundColor Red
}

# Set environment variables
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"

Write-Host "📱 SafeMate Android ready!" -ForegroundColor Green
