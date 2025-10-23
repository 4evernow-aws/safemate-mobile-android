# SafeMate Android Setup Script
# PowerShell script to set up Android development environment

Write-Host "🚀 SafeMate Android Setup Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "`n📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "`n📦 Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check if Android Studio is installed
Write-Host "`n📱 Checking Android Studio installation..." -ForegroundColor Yellow
$androidStudioPath = "${env:ProgramFiles}\Android\Android Studio\bin\studio64.exe"
if (Test-Path $androidStudioPath) {
    Write-Host "✅ Android Studio found at: $androidStudioPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  Android Studio not found. Please install Android Studio from https://developer.android.com/studio" -ForegroundColor Yellow
}

# Check if Android SDK is installed
Write-Host "`n📱 Checking Android SDK..." -ForegroundColor Yellow
$androidSdkPath = "${env:ANDROID_HOME}"
if ($androidSdkPath) {
    Write-Host "✅ ANDROID_HOME set to: $androidSdkPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  ANDROID_HOME not set. Please set ANDROID_HOME environment variable" -ForegroundColor Yellow
}

# Check if Java is installed
Write-Host "`n☕ Checking Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Java not found. Please install JDK 11+ from https://adoptium.net/" -ForegroundColor Yellow
}

# Check if adb is available
Write-Host "`n📱 Checking ADB (Android Debug Bridge)..." -ForegroundColor Yellow
try {
    $adbVersion = adb version
    Write-Host "✅ ADB found: $adbVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ADB not found. Please install Android SDK Platform Tools" -ForegroundColor Yellow
}

# Create debug keystore if it doesn't exist
Write-Host "`n🔐 Setting up debug keystore..." -ForegroundColor Yellow
$debugKeystorePath = "android\app\debug.keystore"
if (-not (Test-Path $debugKeystorePath)) {
    try {
        keytool -genkey -v -keystore $debugKeystorePath -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"
        Write-Host "✅ Debug keystore created" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Failed to create debug keystore. You may need to create it manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Debug keystore already exists" -ForegroundColor Green
}

# Run React Native doctor
Write-Host "`n🔍 Running React Native doctor..." -ForegroundColor Yellow
try {
    npx react-native doctor
    Write-Host "✅ React Native doctor completed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  React Native doctor found some issues. Please review the output above." -ForegroundColor Yellow
}

Write-Host "`n🎉 Setup completed!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start Android emulator or connect Android device" -ForegroundColor White
Write-Host "2. Run: npm run android" -ForegroundColor White
Write-Host "3. Or run: npx react-native run-android" -ForegroundColor White
Write-Host "`nFor more help, see: https://reactnative.dev/docs/environment-setup" -ForegroundColor Cyan
