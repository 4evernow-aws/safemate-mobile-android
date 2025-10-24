# SafeMate Android App Startup Script
# PowerShell script to start the Android app

Write-Host "🚀 SafeMate Android App Startup Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Not in the correct directory. Please run this from the safemate-mobile-android folder." -ForegroundColor Red
    exit 1
}

# Check if emulator is running
Write-Host "`n📱 Checking for Android emulator..." -ForegroundColor Yellow
try {
    $devices = adb devices
    if ($devices -match "emulator") {
        Write-Host "✅ Android emulator detected" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No Android emulator detected. Please start an emulator first." -ForegroundColor Yellow
        Write-Host "  1. Open Android Studio" -ForegroundColor Cyan
        Write-Host "  2. Go to Tools > AVD Manager" -ForegroundColor Cyan
        Write-Host "  3. Start your emulator" -ForegroundColor Cyan
        Write-Host "  4. Then run this script again" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "❌ ADB not found. Please run the fix script first: .\fix-android-environment.ps1" -ForegroundColor Red
    exit 1
}

# Check if Metro is already running
Write-Host "`n🔍 Checking Metro bundler..." -ForegroundColor Yellow
try {
    $metroCheck = netstat -an | findstr ":8081"
    if ($metroCheck) {
        Write-Host "✅ Metro bundler is already running" -ForegroundColor Green
    } else {
        Write-Host "📦 Starting Metro bundler..." -ForegroundColor Yellow
        Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
        Write-Host "✅ Metro bundler started in background" -ForegroundColor Green
        Write-Host "   Wait 10 seconds for Metro to fully start..." -ForegroundColor Cyan
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Host "⚠️  Could not check Metro status. Continuing..." -ForegroundColor Yellow
}

# Build and run the Android app
Write-Host "`n📱 Building and running Android app..." -ForegroundColor Yellow
try {
    Write-Host "This may take 2-3 minutes on first run..." -ForegroundColor Cyan
    npm run android
    Write-Host "`n🎉 App should now be running on your emulator!" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Failed to build/run the app. Common solutions:" -ForegroundColor Red
    Write-Host "  1. Make sure emulator is fully booted" -ForegroundColor Cyan
    Write-Host "  2. Try: npm run clean:android" -ForegroundColor Cyan
    Write-Host "  3. Try: npx react-native run-android" -ForegroundColor Cyan
    Write-Host "  4. Check the error messages above" -ForegroundColor Cyan
}

Write-Host "`n📋 What to expect:" -ForegroundColor Green
Write-Host "• App will install on the emulator" -ForegroundColor White
Write-Host "• SafeMate login screen will appear" -ForegroundColor White
Write-Host "• You can navigate between 5 screens" -ForegroundColor White
Write-Host "• All features are functional" -ForegroundColor White

Write-Host "`n🆘 If you have issues:" -ForegroundColor Yellow
Write-Host "• Check the console output above" -ForegroundColor Cyan
Write-Host "• Make sure emulator is running: adb devices" -ForegroundColor Cyan
Write-Host "• Restart Metro: npm start" -ForegroundColor Cyan
Write-Host "• Clean build: npm run clean:android" -ForegroundColor Cyan
