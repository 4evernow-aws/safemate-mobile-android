# SafeMate Android - Fix Directory Issue
# This script fixes the Cursor directory issue and ensures correct location

Write-Host "=== SafeMate Android - Directory Fix ===" -ForegroundColor Green

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Script directory: $scriptDir" -ForegroundColor Cyan

# Set the correct working directory
Set-Location $scriptDir
Write-Host "Current directory: $PWD" -ForegroundColor Cyan

# Verify we're in the correct directory
if (Test-Path "package.json") {
    Write-Host "✅ Correct directory confirmed - package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Wrong directory - package.json not found" -ForegroundColor Red
    Write-Host "Expected: d:\safemate-mobile-android" -ForegroundColor Yellow
    Write-Host "Current: $PWD" -ForegroundColor Yellow
    exit 1
}

# Set environment variables
$env:ANDROID_HOME = "C:\Users\simon.woods\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\simon.woods\AppData\Local\Android\Sdk\platform-tools"

Write-Host "✅ Environment configured" -ForegroundColor Green
Write-Host "✅ Ready to work with SafeMate Android" -ForegroundColor Green

# Keep the directory set for subsequent commands
Write-Host "Directory is now set to: $PWD" -ForegroundColor Cyan