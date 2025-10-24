# SafeMate Android - Complete Fix and Reinstall
# This script handles all issues and reinstalls the app

Write-Host "=== SafeMate Android Complete Fix and Reinstall ===" -ForegroundColor Green

# Set working directory
$scriptDir = "d:\safemate-mobile-android"
Set-Location $scriptDir
Write-Host "Working directory: $scriptDir" -ForegroundColor Cyan

# Set Android environment
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"
Write-Host "Android environment configured" -ForegroundColor Cyan

# Kill all existing processes
Write-Host "Stopping all existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*java*" -or $_.ProcessName -like "*gradle*" -or $_.ProcessName -like "*node*" -or $_.ProcessName -like "*metro*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Check for port 8081 usage and kill if needed
$port8081 = netstat -ano | findstr :8081
if ($port8081) {
    Write-Host "Port 8081 is in use, killing process..." -ForegroundColor Yellow
    $port8081 | ForEach-Object {
        $pid = ($_ -split '\s+')[-1]
        if ($pid -match '^\d+$') {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
}

# Check emulator connection
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

# Clean Gradle build
Write-Host "Cleaning Gradle build..." -ForegroundColor Yellow
Set-Location "android"
& .\gradlew.bat clean
Set-Location ".."

# Start Metro in new window
Write-Host "Starting Metro bundler in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'd:\safemate-mobile-android'; npm start" -WindowStyle Normal

# Wait for Metro to start
Write-Host "Waiting for Metro to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 12

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

Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host "Check your emulator for the SafeMate app icon." -ForegroundColor Cyan
Write-Host "If you don't see the app, check the Metro window for any errors." -ForegroundColor Yellow

Read-Host "Press Enter to continue"
