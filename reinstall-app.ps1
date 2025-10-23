# SafeMate Android App Reinstallation Script
# This script handles complete app reinstallation and startup

Write-Host "=== SafeMate Android App Reinstallation ===" -ForegroundColor Green
Write-Host "Starting app reinstallation process..." -ForegroundColor Yellow

# Set working directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
Write-Host "Working directory: $scriptDir" -ForegroundColor Cyan

# Set Android environment variables
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"
Write-Host "Android environment configured" -ForegroundColor Cyan

# Stop any existing processes
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*java*" -or $_.ProcessName -like "*gradle*" -or $_.ProcessName -like "*node*" -or $_.ProcessName -like "*metro*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Check ADB connection
Write-Host "Checking ADB connection..." -ForegroundColor Yellow
$adbDevices = & adb devices 2>$null
if ($adbDevices -match "device") {
    Write-Host "ADB devices found:" -ForegroundColor Green
    Write-Host $adbDevices -ForegroundColor White
} else {
    Write-Host "No ADB devices found. Please start your Android emulator first." -ForegroundColor Red
    Write-Host "You can start the emulator from Android Studio or use the AVD Manager." -ForegroundColor Yellow
    Read-Host "Press Enter to continue anyway (will attempt to start emulator)"
}

# Uninstall existing app if present
Write-Host "Uninstalling existing app..." -ForegroundColor Yellow
& adb uninstall com.safemate.android 2>$null
Write-Host "Existing app uninstalled (if present)" -ForegroundColor Green

# Clean and build
Write-Host "Cleaning and building project..." -ForegroundColor Yellow
Set-Location "android"
& .\gradlew.bat clean
if ($LASTEXITCODE -eq 0) {
    Write-Host "Gradle clean successful" -ForegroundColor Green
} else {
    Write-Host "Gradle clean failed, continuing anyway..." -ForegroundColor Yellow
}

# Build the app
Write-Host "Building Android app..." -ForegroundColor Yellow
& .\gradlew.bat assembleDebug
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful" -ForegroundColor Green
} else {
    Write-Host "Build failed, but continuing..." -ForegroundColor Yellow
}

Set-Location ".."

# Start Metro in background
Write-Host "Starting Metro bundler..." -ForegroundColor Yellow
$metroJob = Start-Job -ScriptBlock {
    Set-Location "d:\safemate-mobile-android"
    npm start
}

# Wait for Metro to start
Write-Host "Waiting for Metro to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if Metro is running
$metroRunning = $false
for ($i = 0; $i -lt 10; $i++) {
    $netstat = & netstat -ano | findstr :8081
    if ($netstat) {
        $metroRunning = $true
        Write-Host "Metro is running on port 8081" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
}

if (-not $metroRunning) {
    Write-Host "Metro may not be running properly. Starting manually..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "cd 'd:\safemate-mobile-android'; npm start" -WindowStyle Normal
    Start-Sleep -Seconds 5
}

# Set up ADB reverse
Write-Host "Setting up ADB reverse port forwarding..." -ForegroundColor Yellow
& adb reverse tcp:8081 tcp:8081
if ($LASTEXITCODE -eq 0) {
    Write-Host "ADB reverse configured successfully" -ForegroundColor Green
} else {
    Write-Host "ADB reverse failed, but continuing..." -ForegroundColor Yellow
}

# Install and launch the app
Write-Host "Installing and launching the app..." -ForegroundColor Yellow
& adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
if ($LASTEXITCODE -eq 0) {
    Write-Host "App installed successfully" -ForegroundColor Green
} else {
    Write-Host "App installation failed, trying alternative method..." -ForegroundColor Yellow
    # Try using React Native CLI
    & npm run android
}

# Launch the app
Write-Host "Launching SafeMate app..." -ForegroundColor Yellow
& adb shell am start -n com.safemate.android/.MainActivity
if ($LASTEXITCODE -eq 0) {
    Write-Host "App launched successfully!" -ForegroundColor Green
} else {
    Write-Host "App launch failed, but app should be installed" -ForegroundColor Yellow
}

Write-Host "=== Reinstallation Complete ===" -ForegroundColor Green
Write-Host "The SafeMate app should now be on your emulator." -ForegroundColor Cyan
Write-Host "If you see any errors, check the Metro bundler window for JavaScript errors." -ForegroundColor Yellow

# Keep Metro job running
Write-Host "Metro bundler is running in the background. Keep this window open." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop Metro when you're done testing." -ForegroundColor Yellow

# Wait for user input
Read-Host "Press Enter to continue or Ctrl+C to stop Metro"
Stop-Job $metroJob -ErrorAction SilentlyContinue
Remove-Job $metroJob -ErrorAction SilentlyContinue
