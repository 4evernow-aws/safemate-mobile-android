@echo off
echo ========================================
echo SafeMate Android - Start Emulator and App
echo ========================================

cd /d "d:\safemate-mobile-android"
echo Current directory: %cd%

echo Setting up Android environment...
set ANDROID_HOME=C:\Users\simon.woods\AppData\Local\Android\Sdk
set PATH=%PATH%;C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools
set PATH=%PATH%;C:\Users\simon.woods\AppData\Local\Android\Sdk\emulator

echo Checking for available AVDs...
emulator -list-avds

echo Starting Android emulator...
echo Please wait for the emulator to fully boot up...
start "Android Emulator" cmd /k "emulator -avd Pixel_7_API_34"
REM If the above doesn't work, try: start "Android Emulator" cmd /k "emulator -avd Pixel_6_API_33"
REM Or check available AVDs with: emulator -list-avds

echo Waiting for emulator to start...
timeout /t 30 /nobreak >nul

echo Checking emulator connection...
adb devices

echo Waiting for emulator to be ready...
timeout /t 20 /nobreak >nul

echo Starting Metro bundler in new window...
start "Metro Bundler" cmd /k "cd /d d:\safemate-mobile-android && npm start"

echo Waiting for Metro to start...
timeout /t 15 /nobreak >nul

echo Setting up ADB reverse...
adb reverse tcp:8081 tcp:8081

echo Installing and running app...
npm run android

echo ========================================
echo Done! Check your emulator for the SafeMate app.
echo ========================================
pause
