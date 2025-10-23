# SafeMate Android - Complete Fix Script
# Fixes all terminal session issues and reinstalls the app

Write-Host "=== SafeMate Android Complete Fix ===" -ForegroundColor Green
Write-Host "Fixing all terminal session issues..." -ForegroundColor Yellow

# Force set working directory
$scriptDir = "d:\safemate-mobile-android"
Set-Location $scriptDir
Write-Host "Working directory: $scriptDir" -ForegroundColor Cyan

# Verify we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Not in correct directory! package.json not found." -ForegroundColor Red
    Write-Host "Expected: d:\safemate-mobile-android" -ForegroundColor Yellow
    Write-Host "Current: $scriptDir" -ForegroundColor Yellow
    exit 1
}

# Set Android environment
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"
Write-Host "Android environment configured" -ForegroundColor Cyan

# Kill ALL processes that might interfere
Write-Host "Killing all interfering processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*java*" -or $_.ProcessName -like "*gradle*" -or $_.ProcessName -like "*metro*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Find and kill process using port 8081
Write-Host "Checking port 8081..." -ForegroundColor Yellow
$port8081 = netstat -ano | findstr :8081
if ($port8081) {
    Write-Host "Port 8081 is in use, killing process..." -ForegroundColor Yellow
    $port8081 | ForEach-Object {
        $parts = $_ -split '\s+'
        $pid = $parts[-1]
        if ($pid -match '^\d+$') {
            Write-Host "Killing process $pid" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
}

# Check emulator
Write-Host "Checking emulator connection..." -ForegroundColor Yellow
$adbDevices = & adb devices 2>$null
if ($adbDevices -match "device") {
    Write-Host "Emulator found:" -ForegroundColor Green
    Write-Host $adbDevices -ForegroundColor White
} else {
    Write-Host "No emulator found! Please start your Android emulator first." -ForegroundColor Red
    Write-Host "You can start the emulator from Android Studio or use the AVD Manager." -ForegroundColor Yellow
    Read-Host "Press Enter after starting the emulator"
}

# Uninstall existing app
Write-Host "Removing existing app..." -ForegroundColor Yellow
& adb uninstall com.safemate.android 2>$null
Write-Host "Existing app removed" -ForegroundColor Green

# Clean everything
Write-Host "Cleaning build cache..." -ForegroundColor Yellow
Set-Location "android"
& .\gradlew.bat clean
Set-Location ".."

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
& npm cache clean --force

# Start Metro in new window with explicit directory
Write-Host "Starting Metro bundler..." -ForegroundColor Yellow
$metroScript = @"
cd 'd:\safemate-mobile-android'
Write-Host "Metro starting from: `$PWD" -ForegroundColor Cyan
npm start
"@
Start-Process powershell -ArgumentList "-Command", $metroScript -WindowStyle Normal

# Wait for Metro to start
Write-Host "Waiting for Metro to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check if Metro is running
$metroRunning = $false
for ($i = 0; $i -lt 5; $i++) {
    $netstat = & netstat -ano | findstr :8081
    if ($netstat) {
        $metroRunning = $true
        Write-Host "Metro is running on port 8081" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
}

if (-not $metroRunning) {
    Write-Host "Metro may not be running properly. Please check the Metro window." -ForegroundColor Yellow
}

# Set up ADB reverse
Write-Host "Setting up ADB reverse port forwarding..." -ForegroundColor Yellow
& adb reverse tcp:8081 tcp:8081
if ($LASTEXITCODE -eq 0) {
    Write-Host "ADB reverse configured successfully" -ForegroundColor Green
} else {
    Write-Host "ADB reverse failed, but continuing..." -ForegroundColor Yellow
}

# Build and install the app
Write-Host "Building and installing the app..." -ForegroundColor Yellow
& npm run android

Write-Host "=== Fix Complete ===" -ForegroundColor Green
Write-Host "Check your emulator for the SafeMate app icon." -ForegroundColor Cyan
Write-Host "If you don't see the app, check the Metro window for any errors." -ForegroundColor Yellow

Read-Host "Press Enter to continue"
