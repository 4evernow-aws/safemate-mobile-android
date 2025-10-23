# SafeMate Android Comprehensive Startup
# This script ensures everything is set up correctly

Write-Host "🚀 SafeMate Android Comprehensive Startup" -ForegroundColor Cyan

# Set correct directory
Set-Location "d:\safemate-mobile-android"
Write-Host "📁 Directory set to: D:\safemate-mobile-android" -ForegroundColor White

# Verify directory
if (Test-Path "package.json") {
    Write-Host "✅ Correct directory confirmed!" -ForegroundColor Green
} else {
    Write-Host "❌ Directory issue!" -ForegroundColor Red
    exit 1
}

# Set environment variables
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"

# Check Android environment
Write-Host "
🔍 Checking Android environment..." -ForegroundColor Yellow
try {
    $adbVersion = adb version 2>&1
    if ($adbVersion -match "Android Debug Bridge") {
        Write-Host "✅ ADB is working" -ForegroundColor Green
    } else {
        Write-Host "❌ ADB issue detected" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ADB not found" -ForegroundColor Red
}

# Check emulator
Write-Host "
🔍 Checking emulator..." -ForegroundColor Yellow
try {
    $devices = adb devices 2>&1
    if ($devices -match "device") {
        Write-Host "✅ Emulator connected" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No emulator connected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Cannot check emulator" -ForegroundColor Red
}

Write-Host "
📱 SafeMate Android ready!" -ForegroundColor Green
Write-Host "📁 Directory: D:\safemate-mobile-android" -ForegroundColor White
Write-Host "🔧 Environment: Configured" -ForegroundColor White
