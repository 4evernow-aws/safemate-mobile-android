# SafeMate Android Run Script
# This script helps you run the SafeMate app on Android emulator

Write-Host "🚀 SafeMate Android Setup Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Add Android SDK to PATH
$androidSdkPath = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
$platformToolsPath = "$androidSdkPath\platform-tools"

if (Test-Path $platformToolsPath) {
    $env:PATH += ";$platformToolsPath"
    Write-Host "✅ Added Android SDK platform-tools to PATH" -ForegroundColor Green
} else {
    Write-Host "❌ Android SDK not found at: $androidSdkPath" -ForegroundColor Red
    Write-Host "Please install Android Studio and Android SDK first" -ForegroundColor Yellow
    exit 1
}

# Check if ADB is working
Write-Host "`n📱 Checking Android devices..." -ForegroundColor Cyan
$devices = adb devices
Write-Host $devices

if ($devices -match "device$") {
    Write-Host "✅ Android device/emulator detected!" -ForegroundColor Green
} else {
    Write-Host "❌ No Android devices found" -ForegroundColor Red
    Write-Host "`n📋 To set up an emulator:" -ForegroundColor Yellow
    Write-Host "1. Open Android Studio" -ForegroundColor White
    Write-Host "2. Go to Tools → AVD Manager" -ForegroundColor White
    Write-Host "3. Create a new Virtual Device (recommend Pixel 6 with Android 13)" -ForegroundColor White
    Write-Host "4. Start the emulator" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    Write-Host "`nOr connect a physical Android device with USB debugging enabled" -ForegroundColor Yellow
    exit 1
}

# Check if Metro is running
Write-Host "`n🔄 Checking Metro bundler..." -ForegroundColor Cyan
try {
    $metroResponse = Invoke-WebRequest -Uri "http://localhost:8081/status" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Metro bundler is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Metro bundler is not running" -ForegroundColor Red
    Write-Host "Starting Metro bundler..." -ForegroundColor Yellow
    
    # Start Metro in background
    Start-Process -FilePath "cmd" -ArgumentList "/c", "cd /d `"$PWD`" && npm start" -WindowStyle Minimized
    Write-Host "⏳ Waiting for Metro to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Run the Android app
Write-Host "`n🚀 Building and running SafeMate on Android..." -ForegroundColor Cyan
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow

try {
    # Clean and run
    npx react-native run-android --reset-cache
    Write-Host "`n✅ SafeMate app should now be running on your Android device!" -ForegroundColor Green
    Write-Host "`n📱 App Features:" -ForegroundColor Cyan
    Write-Host "• Enhanced UI with animations" -ForegroundColor White
    Write-Host "• Blockchain integration with Hedera" -ForegroundColor White
    Write-Host "• Local-first file storage" -ForegroundColor White
    Write-Host "• Biometric authentication" -ForegroundColor White
    Write-Host "• Advanced security features" -ForegroundColor White
} catch {
    Write-Host "`n❌ Failed to run the app. Common solutions:" -ForegroundColor Red
    Write-Host "1. Make sure Android emulator is running" -ForegroundColor White
    Write-Host "2. Check that USB debugging is enabled" -ForegroundColor White
    Write-Host "3. Try: npx react-native run-android --reset-cache" -ForegroundColor White
    Write-Host "4. Check Android Studio for any build errors" -ForegroundColor White
}

Write-Host "`n🎉 Setup complete! Happy coding!" -ForegroundColor Green