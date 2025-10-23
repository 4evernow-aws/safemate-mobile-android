@echo off
echo Starting SafeMate Android App...
cd /d "d:\safemate-mobile-android"
echo Current directory: %cd%

echo Setting up Android environment...
set ANDROID_HOME=C:\Users\simon.woods\AppData\Local\Android\Sdk
set PATH=%PATH%;C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools

echo Checking emulator connection...
adb devices

echo Removing old app...
adb uninstall com.safemate.android

echo Starting Metro bundler in new window...
start "Metro Bundler" cmd /k "cd /d d:\safemate-mobile-android && npm start"

echo Waiting for Metro to start...
timeout /t 8 /nobreak >nul

echo Setting up ADB reverse...
adb reverse tcp:8081 tcp:8081

echo Installing and running app...
npm run android

echo Done! Check your emulator for the SafeMate app.
pause
