# Permanent Fix for Cursor Directory Issue
# This script provides multiple solutions to ensure Cursor starts in the correct directory

Write-Host "🔧 Fixing Cursor Directory Issue..." -ForegroundColor Cyan

# Solution 1: Check current directory
Write-Host "`n1️⃣ Checking current directory..." -ForegroundColor Yellow
$currentDir = Get-Location
Write-Host "Current: $currentDir" -ForegroundColor White

# Check if we're in the correct directory
$packageJsonPath = Join-Path $currentDir "package.json"
if (Test-Path $packageJsonPath) {
    Write-Host "✅ Already in correct directory!" -ForegroundColor Green
} else {
    Write-Host "❌ Not in correct directory. Fixing..." -ForegroundColor Red
    
    # Try to navigate to correct directory
    $correctDir = "d:\safemate-mobile-android"
    if (Test-Path $correctDir) {
        Set-Location $correctDir
        Write-Host "✅ Navigated to: $correctDir" -ForegroundColor Green
    } else {
        Write-Host "❌ Cannot find correct directory!" -ForegroundColor Red
        Write-Host "Please ensure the directory exists: $correctDir" -ForegroundColor Red
    }
}

# Solution 2: Create a workspace file
Write-Host "`n2️⃣ Creating Cursor workspace file..." -ForegroundColor Yellow
$workspaceContent = @"
{
    "folders": [
        {
            "path": "d:\\safemate-mobile-android"
        }
    ],
    "settings": {
        "terminal.integrated.cwd": "d:\\safemate-mobile-android"
    }
}
"@

$workspaceFile = "d:\safemate-mobile-android\safemate-android.code-workspace"
$workspaceContent | Out-File -FilePath $workspaceFile -Encoding UTF8
Write-Host "✅ Created workspace file: $workspaceFile" -ForegroundColor Green

# Solution 3: Create a startup script
Write-Host "`n3️⃣ Creating startup script..." -ForegroundColor Yellow
$startupScript = @"
# SafeMate Android Startup Script
# Run this to ensure correct directory

Write-Host "🚀 Starting SafeMate Android..." -ForegroundColor Cyan

# Navigate to correct directory
cd "d:\safemate-mobile-android"

# Verify directory
if (Test-Path "package.json") {
    Write-Host "✅ Correct directory confirmed!" -ForegroundColor Green
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor White
} else {
    Write-Host "❌ Directory issue detected!" -ForegroundColor Red
    Write-Host "Please run: cd 'd:\safemate-mobile-android'" -ForegroundColor Red
}

# Set environment variables
`$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
`$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"

Write-Host "`n📱 Ready to start SafeMate Android!" -ForegroundColor Green
"@

$startupScript | Out-File -FilePath "d:\safemate-mobile-android\start-safemate.ps1" -Encoding UTF8
Write-Host "✅ Created startup script: start-safemate.ps1" -ForegroundColor Green

# Solution 4: Create a batch file for easy access
Write-Host "`n4️⃣ Creating batch file..." -ForegroundColor Yellow
$batchContent = @"
@echo off
echo 🚀 Starting SafeMate Android...
cd /d "d:\safemate-mobile-android"
echo ✅ Directory set to: %CD%
echo 📱 Ready to start SafeMate Android!
pause
"@

$batchContent | Out-File -FilePath "d:\safemate-mobile-android\start-safemate.bat" -Encoding ASCII
Write-Host "✅ Created batch file: start-safemate.bat" -ForegroundColor Green

# Final verification
Write-Host "`n5️⃣ Final verification..." -ForegroundColor Yellow
$finalDir = Get-Location
$finalPackageJson = Join-Path $finalDir "package.json"

if (Test-Path $finalPackageJson) {
    Write-Host "✅ SUCCESS! In correct directory: $finalDir" -ForegroundColor Green
    Write-Host "📁 Package.json found: $(Test-Path $finalPackageJson)" -ForegroundColor Green
} else {
    Write-Host "❌ Still in incorrect directory!" -ForegroundColor Red
    Write-Host "Please run: cd 'd:\safemate-mobile-android'" -ForegroundColor Red
}

Write-Host "`n📋 Solutions created:" -ForegroundColor Cyan
Write-Host "1. Workspace file: safemate-android.code-workspace" -ForegroundColor White
Write-Host "2. Startup script: start-safemate.ps1" -ForegroundColor White
Write-Host "3. Batch file: start-safemate.bat" -ForegroundColor White
Write-Host "4. Directory check: cursor-startup-check.ps1" -ForegroundColor White

Write-Host "`n🚀 To use:" -ForegroundColor Cyan
Write-Host "• Open workspace: safemate-android.code-workspace" -ForegroundColor White
Write-Host "• Run startup: .\start-safemate.ps1" -ForegroundColor White
Write-Host "• Or double-click: start-safemate.bat" -ForegroundColor White
