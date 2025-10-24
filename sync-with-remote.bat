@echo off
echo ========================================
echo SafeMate Android - Sync with Remote
echo ========================================

cd /d "d:\safemate-mobile-android"
echo Current directory: %cd%

echo Checking git status...
git status

echo.
echo Checking remote repositories...
git remote -v

echo.
echo Fetching latest changes from remote...
git fetch origin

echo.
echo Checking differences...
git log --oneline origin/master -5
echo.
git log --oneline HEAD -5

echo.
echo Syncing with remote...
echo Choose sync method:
echo 1. Pull changes (merge)
echo 2. Reset to remote (overwrite local)
echo 3. Stash local changes and pull
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo Pulling changes...
    git pull origin master
) else if "%choice%"=="2" (
    echo Resetting to remote...
    git reset --hard origin/master
) else if "%choice%"=="3" (
    echo Stashing local changes...
    git stash
    echo Pulling changes...
    git pull origin master
    echo Applying stashed changes...
    git stash pop
) else (
    echo Invalid choice. Exiting.
    pause
    exit
)

echo.
echo Sync complete!
echo Checking final status...
git status

echo.
echo ========================================
echo Sync completed successfully!
echo ========================================
pause
