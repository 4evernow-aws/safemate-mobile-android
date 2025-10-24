# SafeMate Metro Bundler Startup Script
# Ensures correct directory and starts Metro properly

# Set the correct working directory
$ProjectRoot = "d:\safemate-mobile-android"
Set-Location $ProjectRoot

Write-Host "🚀 Starting SafeMate Metro Bundler" -ForegroundColor Green
Write-Host "📁 Working Directory: $ProjectRoot" -ForegroundColor Cyan

# Check if we're in the correct directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Not in correct directory. Expected package.json not found." -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Kill existing Metro processes
Write-Host "🔄 Stopping existing Metro processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*metro*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Metro
Write-Host "🚀 Starting Metro bundler..." -ForegroundColor Cyan
npm start
