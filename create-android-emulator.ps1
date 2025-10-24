# SafeMate Android Emulator Creation Script
# PowerShell script to help create Android emulator

Write-Host "📱 SafeMate Android Emulator Creation Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if Android SDK is available
Write-Host "`n🔍 Checking Android SDK..." -ForegroundColor Yellow
if ($env:ANDROID_HOME) {
    Write-Host "✅ ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
    
    # Check if SDK manager is available
    $sdkManager = "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat"
    if (Test-Path $sdkManager) {
        Write-Host "✅ SDK Manager found" -ForegroundColor Green
    } else {
        # Try alternative path
        $sdkManager = "$env:ANDROID_HOME\tools\bin\sdkmanager.bat"
        if (Test-Path $sdkManager) {
            Write-Host "✅ SDK Manager found (alternative path)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  SDK Manager not found. You may need to install command-line tools." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ ANDROID_HOME not set. Please run the fix script first." -ForegroundColor Red
    exit 1
}

# Check if AVD Manager is available
Write-Host "`n🔍 Checking AVD Manager..." -ForegroundColor Yellow
$avdManager = "$env:ANDROID_HOME\cmdline-tools\latest\bin\avdmanager.bat"
if (Test-Path $avdManager) {
    Write-Host "✅ AVD Manager found" -ForegroundColor Green
} else {
    $avdManager = "$env:ANDROID_HOME\tools\bin\avdmanager.bat"
    if (Test-Path $avdManager) {
        Write-Host "✅ AVD Manager found (alternative path)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  AVD Manager not found. You may need to install command-line tools." -ForegroundColor Yellow
    }
}

Write-Host "`n📱 Android Emulator Creation Options:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n🎯 OPTION 1: Manual Creation (Recommended)" -ForegroundColor Green
Write-Host "1. Open Android Studio" -ForegroundColor White
Write-Host "2. Go to Tools > AVD Manager" -ForegroundColor White
Write-Host "3. Click 'Create Device'" -ForegroundColor White
Write-Host "4. Select 'Phone' > 'Pixel 4' > 'Next'" -ForegroundColor White
Write-Host "5. Download 'API 33' if needed > Select it > 'Next'" -ForegroundColor White
Write-Host "6. Name: 'SafeMate_Emulator' > 'Finish'" -ForegroundColor White
Write-Host "7. Click 'Play' button to start emulator" -ForegroundColor White

Write-Host "`n🎯 OPTION 2: Command Line Creation" -ForegroundColor Green
Write-Host "This will attempt to create the emulator via command line..." -ForegroundColor Cyan

$choice = Read-Host "`nChoose option (1 for manual, 2 for command line, or 'q' to quit"
switch ($choice) {
    "1" {
        Write-Host "`n📱 Manual Creation Steps:" -ForegroundColor Green
        Write-Host "1. Open Android Studio from: C:\Program Files\Android\Android Studio\bin\studio64.exe" -ForegroundColor Cyan
        Write-Host "2. Wait for Android Studio to load completely" -ForegroundColor Cyan
        Write-Host "3. Go to Tools > AVD Manager (or More Actions > Virtual Device Manager)" -ForegroundColor Cyan
        Write-Host "4. Click 'Create Device'" -ForegroundColor Cyan
        Write-Host "5. Select 'Phone' category" -ForegroundColor Cyan
        Write-Host "6. Choose 'Pixel 4' device" -ForegroundColor Cyan
        Write-Host "7. Click 'Next'" -ForegroundColor Cyan
        Write-Host "8. In System Image screen:" -ForegroundColor Cyan
        Write-Host "   - Look for 'API 33' (Android 13)" -ForegroundColor Cyan
        Write-Host "   - If not downloaded, click 'Download' next to it" -ForegroundColor Cyan
        Write-Host "   - Wait for download (10-15 minutes)" -ForegroundColor Cyan
        Write-Host "   - Select 'API 33' system image" -ForegroundColor Cyan
        Write-Host "9. Click 'Next'" -ForegroundColor Cyan
        Write-Host "10. Configure:" -ForegroundColor Cyan
        Write-Host "    - AVD Name: SafeMate_Emulator" -ForegroundColor Cyan
        Write-Host "    - Startup Orientation: Portrait" -ForegroundColor Cyan
        Write-Host "    - RAM: 4 GB" -ForegroundColor Cyan
        Write-Host "    - Internal Storage: 8 GB" -ForegroundColor Cyan
        Write-Host "11. Click 'Finish'" -ForegroundColor Cyan
        Write-Host "12. In AVD Manager, click the 'Play' button (▶️) to start emulator" -ForegroundColor Cyan
        Write-Host "13. Wait for emulator to boot (2-3 minutes first time)" -ForegroundColor Cyan
        
        Write-Host "`n✅ After emulator is running, test with:" -ForegroundColor Green
        Write-Host "   adb devices" -ForegroundColor White
        Write-Host "   .\start-android-app.ps1" -ForegroundColor White
    }
    "2" {
        Write-Host "`n🔧 Attempting command line creation..." -ForegroundColor Yellow
        
        # Try to install system image
        Write-Host "Installing Android API 33 system image..." -ForegroundColor Yellow
        try {
            & $sdkManager "system-images;android-33;google_apis;x86_64"
            Write-Host "✅ System image installed" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Failed to install system image via command line" -ForegroundColor Yellow
            Write-Host "Please use manual method (Option 1)" -ForegroundColor Cyan
        }
        
        # Try to create AVD
        Write-Host "Creating AVD..." -ForegroundColor Yellow
        try {
            & $avdManager create avd -n SafeMate_Emulator -k "system-images;android-33;google_apis;x86_64"
            Write-Host "✅ AVD created successfully" -ForegroundColor Green
            Write-Host "You can now start it with: emulator -avd SafeMate_Emulator" -ForegroundColor Cyan
        } catch {
            Write-Host "⚠️  Failed to create AVD via command line" -ForegroundColor Yellow
            Write-Host "Please use manual method (Option 1)" -ForegroundColor Cyan
        }
    }
    "q" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host "`n📋 Next Steps After Emulator Creation:" -ForegroundColor Green
Write-Host "1. Start the emulator" -ForegroundColor White
Write-Host "2. Verify it's running: adb devices" -ForegroundColor White
Write-Host "3. Test the app: .\start-android-app.ps1" -ForegroundColor White

Write-Host "`n🆘 Troubleshooting:" -ForegroundColor Yellow
Write-Host "• If emulator won't start, try increasing RAM allocation" -ForegroundColor Cyan
Write-Host "• If API 33 download fails, try API 32 or 31" -ForegroundColor Cyan
Write-Host "• Make sure virtualization is enabled in BIOS" -ForegroundColor Cyan
Write-Host "• Close other resource-intensive applications" -ForegroundColor Cyan
