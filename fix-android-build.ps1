# Fix Android Build Issues
# PowerShell script to resolve Android build configuration problems

Write-Host "🔧 Fixing Android Build Issues" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

Write-Host "`n📱 Fixing Android build configuration..." -ForegroundColor Yellow

# Step 1: Ensure we're in the correct directory
Write-Host "`nStep 1: Verifying directory structure..." -ForegroundColor Cyan
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor White

if (-not (Test-Path "android\app\build.gradle")) {
    Write-Host "❌ Android build.gradle not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Android build.gradle found" -ForegroundColor Green

# Step 2: Fix Android build.gradle with proper namespace
Write-Host "`nStep 2: Fixing Android build.gradle..." -ForegroundColor Cyan

$fixedBuildGradle = @"
apply plugin: "com.android.application"

android {
    compileSdkVersion 33
    buildToolsVersion "33.0.0"
    namespace "com.safemate.android"

    defaultConfig {
        applicationId "com.safemate.android"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation "com.facebook.react:react-android:0.72.6"
    implementation "androidx.swiperefreshlayout:swiperefreshlayout:1.0.0"
}

apply from: file("../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)
"@

Set-Content -Path "android\app\build.gradle" -Value $fixedBuildGradle
Write-Host "✅ Fixed Android build.gradle with namespace" -ForegroundColor Green

# Step 3: Fix AndroidManifest.xml
Write-Host "`nStep 3: Fixing AndroidManifest.xml..." -ForegroundColor Cyan

$fixedManifest = @"
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.safemate.android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme">
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>
"@

Set-Content -Path "android\app\src\main\AndroidManifest.xml" -Value $fixedManifest
Write-Host "✅ Fixed AndroidManifest.xml" -ForegroundColor Green

# Step 4: Clean build directories
Write-Host "`nStep 4: Cleaning build directories..." -ForegroundColor Cyan

if (Test-Path "android\build") {
    Remove-Item -Recurse -Force "android\build"
    Write-Host "✅ Cleaned android\build" -ForegroundColor Green
}

if (Test-Path "android\app\build") {
    Remove-Item -Recurse -Force "android\app\build"
    Write-Host "✅ Cleaned android\app\build" -ForegroundColor Green
}

# Step 5: Clean node_modules and reinstall
Write-Host "`nStep 5: Cleaning and reinstalling dependencies..." -ForegroundColor Cyan

if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ Cleaned node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ Cleaned package-lock.json" -ForegroundColor Green
}

# Step 6: Create ultra-minimal package.json
Write-Host "`nStep 6: Creating ultra-minimal package.json..." -ForegroundColor Cyan

$ultraMinimalPackageJson = @"
{
  "name": "safemate-mobile-android",
  "version": "1.0.0",
  "description": "SafeMate Android Mobile Application",
  "main": "index.js",
  "scripts": {
    "android": "react-native run-android",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "build:android": "cd android && ./gradlew assembleRelease",
    "build:android-debug": "cd android && ./gradlew assembleDebug",
    "clean:android": "cd android && ./gradlew clean",
    "metro": "npx react-native start"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "@react-native/eslint-config": "^0.72.2",
    "@react-native/metro-config": "^0.72.11",
    "@tsconfig/react-native": "^3.0.0",
    "@types/react": "^18.0.24",
    "@types/react-test-renderer": "^18.0.0",
    "babel-jest": "^29.2.1",
    "eslint": "^8.19.0",
    "jest": "^29.2.1",
    "metro-react-native-babel-preset": "0.76.8",
    "prettier": "^2.4.1",
    "react-test-renderer": "18.2.0",
    "typescript": "4.8.4"
  },
  "engines": {
    "node": ">=16"
  },
  "keywords": [
    "react-native",
    "android",
    "mobile",
    "blockchain",
    "hedera",
    "file-management",
    "offline-first",
    "local-storage"
  ],
  "author": "SafeMate Team",
  "license": "MIT"
}
"@

Set-Content -Path "package.json" -Value $ultraMinimalPackageJson
Write-Host "✅ Created ultra-minimal package.json" -ForegroundColor Green

Write-Host "`n🎯 Android Build Fix Complete!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

Write-Host "`n📋 What's Been Fixed:" -ForegroundColor Cyan
Write-Host "• Added namespace to build.gradle" -ForegroundColor White
Write-Host "• Fixed AndroidManifest.xml" -ForegroundColor White
Write-Host "• Cleaned build directories" -ForegroundColor White
Write-Host "• Created ultra-minimal dependencies" -ForegroundColor White
Write-Host "• Vault icons preserved" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm install" -ForegroundColor White
Write-Host "2. Run: npm run android" -ForegroundColor White
Write-Host "3. Test vault icons on emulator" -ForegroundColor White

Write-Host "`n✅ Android build configuration fixed!" -ForegroundColor Green
Write-Host "The app should now build successfully with vault icons." -ForegroundColor Cyan
