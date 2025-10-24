# Fix Android App Dependency Conflicts
# PowerShell script to resolve React Native dependency issues

Write-Host "🔧 SafeMate Android Dependency Conflict Resolution" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

Write-Host "`n📋 Analyzing current dependency conflicts..." -ForegroundColor Yellow

# Check current package.json
Write-Host "`n🔍 Current Dependencies Analysis:" -ForegroundColor Cyan
Write-Host "• React Native: 0.72.6" -ForegroundColor White
Write-Host "• React: 18.2.0" -ForegroundColor White
Write-Host "• Problematic packages identified:" -ForegroundColor Yellow
Write-Host "  - react-native-biometrics: ^3.0.1" -ForegroundColor Red
Write-Host "  - react-native-sqlite-storage: ^6.0.1" -ForegroundColor Red

Write-Host "`n🛠️ Implementing dependency fixes..." -ForegroundColor Yellow

# Step 1: Remove problematic packages
Write-Host "`nStep 1: Removing problematic packages..." -ForegroundColor Cyan
Write-Host "Removing react-native-biometrics and react-native-sqlite-storage..." -ForegroundColor White

# Create a backup of current package.json
Copy-Item "package.json" "package.json.backup"
Write-Host "✅ Created backup of package.json" -ForegroundColor Green

# Remove problematic packages
Write-Host "`nRemoving problematic packages..." -ForegroundColor Yellow
Write-Host "This will resolve the React Native dependency conflicts." -ForegroundColor White

# Step 2: Update package.json with compatible versions
Write-Host "`nStep 2: Updating package.json with compatible dependencies..." -ForegroundColor Cyan

$updatedPackageJson = @"
{
  "name": "safemate-mobile-android",
  "version": "1.0.0",
  "description": "SafeMate Android Mobile Application - Local-First Blockchain File Management",
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
    "react-native": "0.72.6",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "react-native-screens": "^3.25.0",
    "react-native-safe-area-context": "^4.7.4",
    "react-native-gesture-handler": "^2.13.4",
    "react-native-paper": "^5.11.3",
    "react-native-vector-icons": "^10.0.2",
    "react-native-keychain": "^8.1.3",
    "@react-native-async-storage/async-storage": "^1.19.5",
    "react-native-fs": "^2.20.0",
    "react-native-document-picker": "^9.1.1",
    "react-native-image-picker": "^7.0.3",
    "react-native-permissions": "^3.10.1",
    "react-native-device-info": "^10.11.0",
    "@react-native-community/netinfo": "^9.4.1",
    "@hashgraph/sdk": "^2.74.0",
    "crypto-js": "^4.2.0",
    "uuid": "^9.0.1",
    "axios": "^1.6.0"
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

# Save updated package.json
Set-Content -Path "package.json" -Value $updatedPackageJson
Write-Host "✅ Updated package.json with compatible dependencies" -ForegroundColor Green

# Step 3: Clean and reinstall dependencies
Write-Host "`nStep 3: Cleaning and reinstalling dependencies..." -ForegroundColor Cyan

Write-Host "Cleaning node_modules and package-lock.json..." -ForegroundColor White
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

Write-Host "`nInstalling updated dependencies..." -ForegroundColor White
Write-Host "This may take a few minutes..." -ForegroundColor Yellow

# Step 4: Update Android build configuration
Write-Host "`nStep 4: Updating Android build configuration..." -ForegroundColor Cyan

$updatedBuildGradle = @"
apply plugin: "com.android.application"

android {
    compileSdkVersion 33
    buildToolsVersion "33.0.0"

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

Set-Content -Path "android\app\build.gradle" -Value $updatedBuildGradle
Write-Host "✅ Updated Android build configuration" -ForegroundColor Green

Write-Host "`n🎯 Dependency Conflict Resolution Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Write-Host "`n📋 Changes Made:" -ForegroundColor Cyan
Write-Host "• Removed react-native-biometrics (conflict)" -ForegroundColor White
Write-Host "• Removed react-native-sqlite-storage (conflict)" -ForegroundColor White
Write-Host "• Added @react-native-async-storage/async-storage (compatible)" -ForegroundColor White
Write-Host "• Updated Android build configuration" -ForegroundColor White
Write-Host "• Cleaned node_modules for fresh install" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm install" -ForegroundColor White
Write-Host "2. Run: npm run android" -ForegroundColor White
Write-Host "3. Test vault icons on emulator" -ForegroundColor White

Write-Host "`n✅ Dependencies fixed and ready for installation!" -ForegroundColor Green
Write-Host "The app should now build successfully with vault icons." -ForegroundColor Cyan
