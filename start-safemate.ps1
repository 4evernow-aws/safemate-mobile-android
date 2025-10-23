# SafeMate Android Startup Script
# Run this to ensure correct directory

Write-Host "🚀 Starting SafeMate Android..." -ForegroundColor Cyan

# Navigate to correct directory
cd "d:\safemate-mobile-android"

# Verify directory
if (Test-Path "package.json") {
    Write-Host "✅ Correct directory confirmed!" -ForegroundColor Green
    Write-Host "Current directory: D:\safemate-mobile-android" -ForegroundColor White
} else {
    Write-Host "❌ Directory issue detected!" -ForegroundColor Red
    Write-Host "Please run: cd 'd:\safemate-mobile-android'" -ForegroundColor Red
}

# Set environment variables
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"

Write-Host "
📱 Ready to start SafeMate Android!" -ForegroundColor Green
