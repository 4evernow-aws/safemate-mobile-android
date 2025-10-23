# Debug Metro Connection - Detailed network analysis
# This script provides detailed debugging information for Metro connection issues

Write-Host "🔍 Debugging Metro Connection" -ForegroundColor Green

# Set correct directory
$ProjectRoot = "d:\safemate-mobile-android"
Set-Location $ProjectRoot

# Set Android environment
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"

Write-Host "📁 Working Directory: $ProjectRoot" -ForegroundColor Cyan

# Check Metro status
Write-Host "🔍 Checking Metro status..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/status" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Metro Status: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Metro not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Check network interfaces
Write-Host "🔍 Checking network interfaces..." -ForegroundColor Cyan
try {
    $netstat = netstat -ano | findstr :8081
    Write-Host "📡 Port 8081 status:" -ForegroundColor Cyan
    Write-Host $netstat -ForegroundColor Gray
} catch {
    Write-Host "⚠️ Could not check port status" -ForegroundColor Yellow
}

# Check ADB devices
Write-Host "🔍 Checking ADB devices..." -ForegroundColor Cyan
try {
    $devices = adb devices
    Write-Host "📱 ADB Devices:" -ForegroundColor Cyan
    Write-Host $devices -ForegroundColor Gray
} catch {
    Write-Host "⚠️ Could not check ADB devices" -ForegroundColor Yellow
}

# Check ADB reverse port forwarding
Write-Host "🔍 Checking ADB reverse port forwarding..." -ForegroundColor Cyan
try {
    $reverse = adb reverse --list
    Write-Host "🔗 ADB Reverse Ports:" -ForegroundColor Cyan
    Write-Host $reverse -ForegroundColor Gray
} catch {
    Write-Host "⚠️ Could not check ADB reverse" -ForegroundColor Yellow
}

# Test emulator connectivity to host
Write-Host "🔍 Testing emulator connectivity..." -ForegroundColor Cyan
try {
    $pingResult = adb shell "ping -c 1 10.0.2.2" 2>$null
    Write-Host "📡 Emulator ping result:" -ForegroundColor Cyan
    Write-Host $pingResult -ForegroundColor Gray
} catch {
    Write-Host "⚠️ Could not test emulator connectivity" -ForegroundColor Yellow
}

# Check app logs for specific errors
Write-Host "🔍 Checking app logs for specific errors..." -ForegroundColor Cyan
try {
    $logs = adb logcat -d | Select-String "Unable to load script|Metro|ReactNative|Exception|Error" | Select-Object -Last 10
    Write-Host "📋 Recent app logs:" -ForegroundColor Cyan
    Write-Host $logs -ForegroundColor Gray
} catch {
    Write-Host "⚠️ Could not check app logs" -ForegroundColor Yellow
}

# Check if app is running
Write-Host "🔍 Checking app status..." -ForegroundColor Cyan
try {
    $appStatus = adb shell dumpsys activity activities | Select-String "mCurrentFocus"
    Write-Host "📱 App status:" -ForegroundColor Cyan
    Write-Host $appStatus -ForegroundColor Gray
} catch {
    Write-Host "⚠️ Could not check app status" -ForegroundColor Yellow
}

Write-Host "🎯 Debug complete!" -ForegroundColor Green
Write-Host "💡 If Metro connection issues persist, try:" -ForegroundColor Cyan
Write-Host "   1. Restart Android emulator" -ForegroundColor Gray
Write-Host "   2. Check Windows Firewall settings" -ForegroundColor Gray
Write-Host "   3. Try: adb reverse tcp:8081 tcp:8081" -ForegroundColor Gray
Write-Host "   4. Check Metro is running: curl http://localhost:8081/status" -ForegroundColor Gray
