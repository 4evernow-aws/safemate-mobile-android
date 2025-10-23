# Permanent Fix for Cursor Startup Directory Issue
# This script creates multiple solutions to ensure Cursor always starts in the correct directory

Write-Host "🔧 Creating Permanent Cursor Directory Fix..." -ForegroundColor Cyan

# 1. Create a .vscode/settings.json file to force the correct directory
$vscodeDir = "d:\safemate-mobile-android\.vscode"
if (-not (Test-Path $vscodeDir)) {
    New-Item -ItemType Directory -Path $vscodeDir -Force
    Write-Host "✅ Created .vscode directory" -ForegroundColor Green
}

$vscodeSettings = @"
{
    "terminal.integrated.cwd": "d:\\safemate-mobile-android",
    "terminal.integrated.defaultProfile.windows": "PowerShell",
    "terminal.integrated.profiles.windows": {
        "PowerShell": {
            "source": "PowerShell",
            "args": ["-NoExit", "-Command", "cd 'd:\\safemate-mobile-android'"]
        }
    },
    "files.defaultLanguage": "typescript",
    "typescript.preferences.includePackageJsonAutoImports": "on"
}
"@

$vscodeSettings | Out-File -FilePath "$vscodeDir\settings.json" -Encoding UTF8
Write-Host "✅ Created .vscode/settings.json" -ForegroundColor Green

# 2. Create a PowerShell profile script
$profileScript = @"
# SafeMate Android PowerShell Profile
# This ensures the correct directory is always set

Write-Host "🚀 SafeMate Android Profile Loaded" -ForegroundColor Cyan

# Set the correct directory
Set-Location "d:\safemate-mobile-android"

# Verify we're in the right place
if (Test-Path "package.json") {
    Write-Host "✅ SafeMate Android directory confirmed!" -ForegroundColor Green
    Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor White
} else {
    Write-Host "❌ Directory issue detected!" -ForegroundColor Red
    Write-Host "Please run: cd 'd:\safemate-mobile-android'" -ForegroundColor Red
}

# Set environment variables
`$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
`$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"

Write-Host "📱 SafeMate Android ready!" -ForegroundColor Green
"@

$profileScript | Out-File -FilePath "d:\safemate-mobile-android\SafeMate-Profile.ps1" -Encoding UTF8
Write-Host "✅ Created SafeMate-Profile.ps1" -ForegroundColor Green

# 3. Create a startup batch file that opens Cursor in the correct directory
$startupBatch = @"
@echo off
echo 🚀 Starting SafeMate Android in Cursor...
cd /d "d:\safemate-mobile-android"
echo ✅ Directory set to: %CD%
echo 📱 Opening Cursor in SafeMate Android directory...
start "" "C:\Users\simon.woods\AppData\Local\Programs\cursor\Cursor.exe" "d:\safemate-mobile-android"
echo ✅ Cursor opened in correct directory!
pause
"@

$startupBatch | Out-File -FilePath "d:\safemate-mobile-android\open-cursor-here.bat" -Encoding ASCII
Write-Host "✅ Created open-cursor-here.bat" -ForegroundColor Green

# 4. Create a desktop shortcut script
$desktopShortcut = @"
@echo off
echo 🚀 Creating SafeMate Android Desktop Shortcut...
cd /d "d:\safemate-mobile-android"
echo ✅ Directory set to: %CD%
echo 📱 Creating desktop shortcut...
powershell -Command "`$WshShell = New-Object -comObject WScript.Shell; `$Shortcut = `$WshShell.CreateShortcut('$env:USERPROFILE\Desktop\SafeMate Android.lnk'); `$Shortcut.TargetPath = 'C:\Users\simon.woods\AppData\Local\Programs\cursor\Cursor.exe'; `$Shortcut.Arguments = 'd:\safemate-mobile-android'; `$Shortcut.WorkingDirectory = 'd:\safemate-mobile-android'; `$Shortcut.Save()"
echo ✅ Desktop shortcut created!
pause
"@

$desktopShortcut | Out-File -FilePath "d:\safemate-mobile-android\create-desktop-shortcut.bat" -Encoding ASCII
Write-Host "✅ Created create-desktop-shortcut.bat" -ForegroundColor Green

# 5. Update the workspace file with better settings
$workspaceContent = @"
{
    "folders": [
        {
            "path": "d:\\safemate-mobile-android",
            "name": "SafeMate Android"
        }
    ],
    "settings": {
        "terminal.integrated.cwd": "d:\\safemate-mobile-android",
        "terminal.integrated.defaultProfile.windows": "PowerShell",
        "terminal.integrated.profiles.windows": {
            "PowerShell": {
                "source": "PowerShell",
                "args": ["-NoExit", "-Command", "cd 'd:\\safemate-mobile-android'"]
            }
        },
        "files.defaultLanguage": "typescript",
        "typescript.preferences.includePackageJsonAutoImports": "on",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.fixAll.eslint": true
        }
    },
    "extensions": {
        "recommendations": [
            "ms-vscode.vscode-typescript-next",
            "bradlc.vscode-tailwindcss",
            "esbenp.prettier-vscode"
        ]
    }
}
"@

$workspaceContent | Out-File -FilePath "d:\safemate-mobile-android\safemate-android.code-workspace" -Encoding UTF8
Write-Host "✅ Updated workspace file" -ForegroundColor Green

# 6. Create a comprehensive startup script
$comprehensiveStartup = @"
# SafeMate Android Comprehensive Startup
# This script ensures everything is set up correctly

Write-Host "🚀 SafeMate Android Comprehensive Startup" -ForegroundColor Cyan

# Set correct directory
Set-Location "d:\safemate-mobile-android"
Write-Host "📁 Directory set to: $(Get-Location)" -ForegroundColor White

# Verify directory
if (Test-Path "package.json") {
    Write-Host "✅ Correct directory confirmed!" -ForegroundColor Green
} else {
    Write-Host "❌ Directory issue!" -ForegroundColor Red
    exit 1
}

# Set environment variables
`$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
`$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"

# Check Android environment
Write-Host "`n🔍 Checking Android environment..." -ForegroundColor Yellow
try {
    `$adbVersion = adb version 2>&1
    if (`$adbVersion -match "Android Debug Bridge") {
        Write-Host "✅ ADB is working" -ForegroundColor Green
    } else {
        Write-Host "❌ ADB issue detected" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ADB not found" -ForegroundColor Red
}

# Check emulator
Write-Host "`n🔍 Checking emulator..." -ForegroundColor Yellow
try {
    `$devices = adb devices 2>&1
    if (`$devices -match "device") {
        Write-Host "✅ Emulator connected" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No emulator connected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Cannot check emulator" -ForegroundColor Red
}

Write-Host "`n📱 SafeMate Android ready!" -ForegroundColor Green
Write-Host "📁 Directory: $(Get-Location)" -ForegroundColor White
Write-Host "🔧 Environment: Configured" -ForegroundColor White
"@

$comprehensiveStartup | Out-File -FilePath "d:\safemate-mobile-android\comprehensive-startup.ps1" -Encoding UTF8
Write-Host "✅ Created comprehensive-startup.ps1" -ForegroundColor Green

Write-Host "`n🎯 Solutions Created:" -ForegroundColor Cyan
Write-Host "1. .vscode/settings.json - Forces correct directory" -ForegroundColor White
Write-Host "2. SafeMate-Profile.ps1 - PowerShell profile" -ForegroundColor White
Write-Host "3. open-cursor-here.bat - Opens Cursor in correct directory" -ForegroundColor White
Write-Host "4. create-desktop-shortcut.bat - Creates desktop shortcut" -ForegroundColor White
Write-Host "5. safemate-android.code-workspace - Updated workspace" -ForegroundColor White
Write-Host "6. comprehensive-startup.ps1 - Full startup check" -ForegroundColor White

Write-Host "`n🚀 How to Use:" -ForegroundColor Cyan
Write-Host "• Run: .\comprehensive-startup.ps1" -ForegroundColor White
Write-Host "• Or: .\open-cursor-here.bat" -ForegroundColor White
Write-Host "• Or: Double-click safemate-android.code-workspace" -ForegroundColor White
