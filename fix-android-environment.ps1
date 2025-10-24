# SafeMate Android Environment Fix Script
# PowerShell script to fix Android development environment

Write-Host "🔧 SafeMate Android Environment Fix Script" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Function to set environment variable for current session
function Set-EnvVar {
    param($Name, $Value)
    [Environment]::SetEnvironmentVariable($Name, $Value, "User")
    Set-Item -Path "env:$Name" -Value $Value
    Write-Host "✅ Set $Name = $Value" -ForegroundColor Green
}

# Check if Android Studio is installed
$androidStudioPath = "${env:ProgramFiles}\Android\Android Studio"
if (Test-Path $androidStudioPath) {
    Write-Host "`n📱 Android Studio found at: $androidStudioPath" -ForegroundColor Green
    
    # Try to find Android SDK in common locations
    $possibleSdkPaths = @(
        "${env:USERPROFILE}\AppData\Local\Android\Sdk",
        "${env:ProgramFiles}\Android\Android Studio\sdk",
        "${env:ProgramFiles(x86)}\Android\android-sdk",
        "C:\Android\Sdk"
    )
    
    $sdkPath = $null
    foreach ($path in $possibleSdkPaths) {
        if (Test-Path $path) {
            $sdkPath = $path
            Write-Host "✅ Found Android SDK at: $sdkPath" -ForegroundColor Green
            break
        }
    }
    
    if ($sdkPath) {
        # Set ANDROID_HOME
        Set-EnvVar "ANDROID_HOME" $sdkPath
        
        # Add Android SDK tools to PATH
        $androidTools = "$sdkPath\platform-tools"
        $androidBuildTools = "$sdkPath\build-tools\33.0.0"
        $androidPlatformTools = "$sdkPath\tools"
        
        if (Test-Path $androidTools) {
            $currentPath = $env:PATH
            if ($currentPath -notlike "*$androidTools*") {
                $env:PATH = "$androidTools;$currentPath"
                Write-Host "✅ Added Android tools to PATH: $androidTools" -ForegroundColor Green
            }
        }
        
        # Check if ADB is now available
        try {
            $adbVersion = adb version 2>&1
            Write-Host "✅ ADB is now available" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  ADB still not found. You may need to restart your terminal." -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Android SDK not found. Please install Android SDK through Android Studio." -ForegroundColor Red
        Write-Host "  1. Open Android Studio" -ForegroundColor Cyan
        Write-Host "  2. Go to File > Settings > Appearance & Behavior > System Settings > Android SDK" -ForegroundColor Cyan
        Write-Host "  3. Install Android SDK Platform 33 and Android SDK Build-Tools 33.0.0" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Android Studio not found. Please install Android Studio first." -ForegroundColor Red
    Write-Host "  Download from: https://developer.android.com/studio" -ForegroundColor Cyan
}

# Check if we can find Android SDK through Android Studio
Write-Host "`n🔍 Checking for Android SDK..." -ForegroundColor Yellow

# Try to find SDK through Android Studio installation
$androidStudioSdkPath = "${env:USERPROFILE}\AppData\Local\Android\Sdk"
if (Test-Path $androidStudioSdkPath) {
    Write-Host "✅ Found Android SDK at: $androidStudioSdkPath" -ForegroundColor Green
    Set-EnvVar "ANDROID_HOME" $androidStudioSdkPath
    
    # Add to PATH
    $platformTools = "$androidStudioSdkPath\platform-tools"
    if (Test-Path $platformTools) {
        $env:PATH = "$platformTools;$env:PATH"
        Write-Host "✅ Added platform-tools to PATH" -ForegroundColor Green
    }
}

# Test ADB again
Write-Host "`n🔍 Testing ADB..." -ForegroundColor Yellow
try {
    $adbVersion = adb version 2>&1
    Write-Host "✅ ADB is working: $adbVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ADB still not working. You may need to:" -ForegroundColor Yellow
    Write-Host "  1. Restart your terminal/command prompt" -ForegroundColor Cyan
    Write-Host "  2. Restart your computer" -ForegroundColor Cyan
    Write-Host "  3. Manually set ANDROID_HOME environment variable" -ForegroundColor Cyan
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. Open Android Studio" -ForegroundColor White
Write-Host "2. Go to Tools > AVD Manager" -ForegroundColor White
Write-Host "3. Create a new Virtual Device" -ForegroundColor White
Write-Host "4. Choose a device (e.g., Pixel 4)" -ForegroundColor White
Write-Host "5. Download and select Android API 33" -ForegroundColor White
Write-Host "6. Start the emulator" -ForegroundColor White
Write-Host "7. Run: npm run android" -ForegroundColor White

Write-Host "`n📱 Android Studio AVD Manager Guide:" -ForegroundColor Cyan
Write-Host "1. Open Android Studio" -ForegroundColor White
Write-Host "2. Click 'More Actions' > 'Virtual Device Manager'" -ForegroundColor White
Write-Host "3. Click 'Create Device'" -ForegroundColor White
Write-Host "4. Select 'Phone' > 'Pixel 4' > 'Next'" -ForegroundColor White
Write-Host "5. Download 'API 33' if not already downloaded" -ForegroundColor White
Write-Host "6. Select 'API 33' > 'Next'" -ForegroundColor White
Write-Host "7. Name it 'SafeMate_Emulator' > 'Finish'" -ForegroundColor White
Write-Host "8. Click the 'Play' button to start the emulator" -ForegroundColor White
