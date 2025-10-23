# SafeMate Android App Startup Script
# Ensures correct directory and proper Metro connection

param(
    [switch]$Force,
    [switch]$Clean
)

# Set the correct working directory
$ProjectRoot = "d:\safemate-mobile-android"
Set-Location $ProjectRoot

Write-Host "🚀 SafeMate Android App Startup Script" -ForegroundColor Green
Write-Host "📁 Working Directory: $ProjectRoot" -ForegroundColor Cyan

# Check if we're in the correct directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Not in correct directory. Expected package.json not found." -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Confirmed in correct directory" -ForegroundColor Green

# Set Android environment variables
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"

Write-Host "🔧 Android environment configured" -ForegroundColor Cyan

# Kill existing processes if Force flag is used
if ($Force) {
    Write-Host "🔄 Force mode: Killing existing processes..." -ForegroundColor Yellow
    Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*metro*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Clean build if requested
if ($Clean) {
    Write-Host "🧹 Cleaning build..." -ForegroundColor Yellow
    Set-Location "android"
    .\gradlew.bat clean
    Set-Location ".."
}

# Check if Metro is already running
$MetroRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/status" -TimeoutSec 2 -ErrorAction Stop
    if ($response.Content -like "*packager-status:running*") {
        $MetroRunning = $true
        Write-Host "✅ Metro is already running" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ️ Metro not running, will start it..." -ForegroundColor Yellow
}

# Start Metro if not running
if (-not $MetroRunning) {
    Write-Host "🚀 Starting Metro bundler..." -ForegroundColor Cyan
    Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory $ProjectRoot -WindowStyle Minimized
    Write-Host "⏳ Waiting for Metro to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    
    # Verify Metro is running
    $MetroStarted = $false
    for ($i = 0; $i -lt 10; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8081/status" -TimeoutSec 2 -ErrorAction Stop
            if ($response.Content -like "*packager-status:running*") {
                $MetroStarted = $true
                break
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    
    if (-not $MetroStarted) {
        Write-Host "❌ Failed to start Metro bundler" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Metro bundler started successfully" -ForegroundColor Green
}

# Set up ADB reverse port forwarding
Write-Host "🔗 Setting up ADB reverse port forwarding..." -ForegroundColor Cyan
try {
    adb reverse tcp:8081 tcp:8081
    Write-Host "✅ ADB reverse port forwarding configured" -ForegroundColor Green
} catch {
    Write-Host "⚠️ ADB reverse failed, but continuing..." -ForegroundColor Yellow
}

# Stop existing app instance
Write-Host "🛑 Stopping existing app instance..." -ForegroundColor Yellow
try {
    adb shell am force-stop com.safemate.android
} catch {
    Write-Host "ℹ️ No existing app to stop" -ForegroundColor Gray
}

# Launch the app
Write-Host "📱 Launching SafeMate Android app..." -ForegroundColor Cyan
try {
    adb shell am start -n com.safemate.android/.MainActivity
    Write-Host "✅ App launched successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to launch app" -ForegroundColor Red
    exit 1
}

# Check app status
Write-Host "🔍 Checking app status..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

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
Start-Sleep -Seconds 2

try {
    $logs = adb logcat -d | Select-String "Metro|ReactNative|JS|Bundle|Exception" | Select-Object -Last 5
    if ($logs -like "*Unable to load script*") {
        Write-Host "⚠️ Metro connection issue detected" -ForegroundColor Yellow
        Write-Host "💡 Try running: adb reverse tcp:8081 tcp:8081" -ForegroundColor Cyan
    } else {
        Write-Host "✅ No Metro connection issues detected" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ️ Could not check logs" -ForegroundColor Gray
}

Write-Host "🎉 SafeMate Android app startup complete!" -ForegroundColor Green
Write-Host "📱 App should be running on your device/emulator" -ForegroundColor Cyan
Write-Host "🌐 Metro bundler is running on http://localhost:8081" -ForegroundColor Cyan
