@echo off
echo 🔧 Fixing Cursor Directory Issue...
echo.

REM Navigate to correct directory
cd /d "d:\safemate-mobile-android"
echo ✅ Directory set to: %CD%

REM Verify we're in the right place
if exist "package.json" (
    echo ✅ Correct directory confirmed!
    echo 📁 Found package.json
) else (
    echo ❌ Directory issue detected!
    echo Please ensure you're in: d:\safemate-mobile-android
    pause
    exit /b 1
)

REM Open Cursor in the correct directory
echo 🚀 Opening Cursor in SafeMate Android directory...
start "" "D:\Cursor\Cursor.exe" "d:\safemate-mobile-android"

echo ✅ Cursor opened in correct directory!
echo 📱 SafeMate Android ready!
pause
