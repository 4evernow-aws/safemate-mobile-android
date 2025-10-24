# Quick SafeMate App Reinstallation
# Simple script to get the app back on the emulator

Write-Host "=== Quick SafeMate App Reinstall ===" -ForegroundColor Green

# Set directory and environment
Set-Location "d:\safemate-mobile-android"
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"

# Check emulator
Write-Host "Checking emulator connection..." -ForegroundColor Yellow
$devices = & adb devices
if ($devices -notmatch "device") {
    Write-Host "No emulator found! Please start your Android emulator first." -ForegroundColor Red
    Read-Host "Press Enter after starting the emulator"
}

# Uninstall old app
Write-Host "Removing old app..." -ForegroundColor Yellow
& adb uninstall com.safemate.android 2>$null

# Start Metro in new window
Write-Host "Starting Metro bundler..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'd:\safemate-mobile-android'; npm start" -WindowStyle Normal

# Wait for Metro
Start-Sleep -Seconds 8

# Set up ADB reverse
Write-Host "Configuring ADB reverse..." -ForegroundColor Yellow
& adb reverse tcp:8081 tcp:8081

# Install and run
Write-Host "Installing and running app..." -ForegroundColor Yellow
& npm run android

Write-Host "=== Done! Check your emulator for the SafeMate app ===" -ForegroundColor Green
