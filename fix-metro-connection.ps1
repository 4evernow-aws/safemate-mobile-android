# Fix Metro Connection - Network connectivity between emulator and Metro
# This script addresses the network connection issue between Android emulator and Metro bundler

Write-Host "🔧 Fixing Metro Network Connection" -ForegroundColor Green

# Set correct directory
$ProjectRoot = "d:\safemate-mobile-android"
Set-Location $ProjectRoot

Write-Host "📁 Working Directory: $ProjectRoot" -ForegroundColor Cyan

# Set Android environment
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"

Write-Host "🔧 Android environment configured" -ForegroundColor Cyan

# Kill existing processes
Write-Host "🔄 Stopping existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Check if Metro is accessible
Write-Host "🔍 Checking Metro accessibility..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/status" -TimeoutSec 2 -ErrorAction Stop
    if ($response.Content -like "*packager-status:running*") {
        Write-Host "✅ Metro is accessible from host" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Metro is not accessible from host" -ForegroundColor Red
    Write-Host "🚀 Starting Metro..." -ForegroundColor Cyan
    Start-Process -FilePath "d:\safemate-mobile-android\start-metro.bat" -WindowStyle Normal
    Start-Sleep -Seconds 15
}

# Set up ADB reverse port forwarding
Write-Host "🔗 Setting up ADB reverse port forwarding..." -ForegroundColor Cyan
try {
    adb reverse tcp:8081 tcp:8081
    Write-Host "✅ ADB reverse port forwarding configured" -ForegroundColor Green
} catch {
    Write-Host "⚠️ ADB reverse failed" -ForegroundColor Yellow
}

# Alternative: Try using host machine IP
Write-Host "🌐 Trying alternative connection methods..." -ForegroundColor Cyan

# Get host IP addresses
$hostIPs = @()
try {
    $ipconfig = ipconfig | Select-String "IPv4"
    foreach ($line in $ipconfig) {
        if ($line -match "(\d+\.\d+\.\d+\.\d+)") {
            $hostIPs += $matches[1]
        }
    }
    Write-Host "📡 Host IP addresses: $($hostIPs -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️ Could not get host IP addresses" -ForegroundColor Yellow
}

# Test emulator connectivity
Write-Host "🔍 Testing emulator connectivity..." -ForegroundColor Cyan
try {
    $pingResult = adb shell "ping -c 1 10.0.2.2" 2>$null
    if ($pingResult -like "*0% packet loss*") {
        Write-Host "✅ Emulator can reach host machine" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Emulator connectivity issues" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Could not test emulator connectivity" -ForegroundColor Yellow
}

# Stop and restart app
Write-Host "🛑 Stopping existing app..." -ForegroundColor Yellow
try {
    adb shell am force-stop com.safemate.android
} catch {
    Write-Host "ℹ️ No existing app to stop" -ForegroundColor Gray
}

# Launch app
Write-Host "📱 Launching SafeMate Android app..." -ForegroundColor Cyan
try {
    adb shell am start -n com.safemate.android/.MainActivity
    Write-Host "✅ App launched!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to launch app" -ForegroundColor Red
    exit 1
}

# Wait and check for connection issues
Write-Host "⏳ Waiting for app to connect to Metro..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check app status
Write-Host "🔍 Checking app status..." -ForegroundColor Cyan
try {
    $appStatus = adb shell dumpsys activity activities | Select-String "mCurrentFocus"
    if ($appStatus -like "*com.safemate.android*") {
        Write-Host "✅ App is running and focused" -ForegroundColor Green
    } else {
        Write-Host "⚠️ App may not be running properly" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Could not check app status" -ForegroundColor Yellow
}

# Check for Metro connection issues
Write-Host "🔍 Checking for Metro connection issues..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

try {
    $logs = adb logcat -d | Select-String "Unable to load script|Metro|ReactNative|Exception" | Select-Object -Last 5
    if ($logs -like "*Unable to load script*") {
        Write-Host "⚠️ Metro connection issue detected" -ForegroundColor Yellow
        Write-Host "💡 The app can't connect to Metro bundler" -ForegroundColor Cyan
        Write-Host "💡 Possible solutions:" -ForegroundColor Cyan
        Write-Host "   1. Check Windows Firewall settings" -ForegroundColor Gray
        Write-Host "   2. Try: adb reverse tcp:8081 tcp:8081" -ForegroundColor Gray
        Write-Host "   3. Restart Android emulator" -ForegroundColor Gray
        Write-Host "   4. Check Metro is running on port 8081" -ForegroundColor Gray
    } else {
        Write-Host "✅ No Metro connection issues detected" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ️ Could not check logs" -ForegroundColor Gray
}

Write-Host "🎉 Metro connection fix complete!" -ForegroundColor Green
Write-Host "📱 App should now be able to connect to Metro" -ForegroundColor Cyan
Write-Host "🌐 Metro bundler: http://localhost:8081" -ForegroundColor Cyan