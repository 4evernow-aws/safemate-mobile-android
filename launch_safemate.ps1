# Launch SafeMate App Script
# This script helps launch the SafeMate app on Android

Write-Host "🚀 Launching SafeMate App..." -ForegroundColor Green

# Set Android environment variables
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"

# Check if adb is available
try {
    $adbVersion = adb version 2>$null
    Write-Host "✅ ADB is available" -ForegroundColor Green
} catch {
    Write-Host "❌ ADB not found. Please check your Android SDK installation." -ForegroundColor Red
    exit 1
}

# Check if device is connected
$devices = adb devices
if ($devices -match "device$") {
    Write-Host "✅ Android device connected" -ForegroundColor Green
} else {
    Write-Host "❌ No Android device connected. Please start your emulator or connect a device." -ForegroundColor Red
    exit 1
}

# Check if SafeMate app is installed
$packages = adb shell pm list packages | findstr safemate
if ($packages) {
    Write-Host "✅ SafeMate app is installed" -ForegroundColor Green
} else {
    Write-Host "❌ SafeMate app not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Launch the app
Write-Host "🎯 Launching SafeMate..." -ForegroundColor Yellow
$result = adb shell am start -n com.safemateandroid/.MainActivity

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SafeMate launched successfully!" -ForegroundColor Green
    Write-Host "📱 Check your Android device for the SafeMate app." -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to launch SafeMate. Error: $result" -ForegroundColor Red
}

Write-Host "`n💡 Tips:" -ForegroundColor Yellow
Write-Host "   - If you can't see the app icon, try swiping up to see all apps" -ForegroundColor White
Write-Host "   - Look for 'SafeMate' in your app drawer" -ForegroundColor White
Write-Host "   - The app should appear with a shield icon" -ForegroundColor White
