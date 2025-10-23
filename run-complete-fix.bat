@echo off
echo ========================================
echo SafeMate Android - Complete Fix
echo ========================================

cd /d "d:\safemate-mobile-android"
echo Current directory: %cd%

echo Setting up Android environment...
set ANDROID_HOME=C:\Users\simon.woods\AppData\Local\Android\Sdk
set PATH=%PATH%;C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools

echo Killing all conflicting processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im java.exe 2>nul
taskkill /f /im gradle.exe 2>nul
timeout /t 3 /nobreak >nul

echo Finding and killing process using port 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    echo Killing process %%a
    taskkill /f /pid %%a 2>nul
)
timeout /t 2 /nobreak >nul

echo Checking emulator...
adb devices

echo Removing old app...
adb uninstall com.safemate.android

echo Cleaning build...
cd android
gradlew.bat clean
cd ..

echo Starting Metro in new window...
start "Metro Bundler" cmd /k "cd /d d:\safemate-mobile-android && npm start"

echo Waiting for Metro to start...
timeout /t 15 /nobreak >nul

echo Setting up ADB reverse...
adb reverse tcp:8081 tcp:8081

echo Installing and running app...
npm run android

echo ========================================
echo Complete fix finished!
echo Check your emulator for the SafeMate app.
echo ========================================
pause
