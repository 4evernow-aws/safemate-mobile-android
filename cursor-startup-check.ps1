# Cursor Startup Directory Check and Fix
# This script ensures Cursor starts in the correct directory

Write-Host "🔍 Checking Cursor startup directory..." -ForegroundColor Cyan

# Get current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Yellow

# Check if we're in the correct directory
$packageJsonPath = Join-Path $currentDir "package.json"
if (Test-Path $packageJsonPath) {
    Write-Host "✅ Correct directory detected!" -ForegroundColor Green
    Write-Host "Found package.json in: $currentDir" -ForegroundColor Green
} else {
    Write-Host "❌ Incorrect directory!" -ForegroundColor Red
    Write-Host "Expected to find package.json in: $currentDir" -ForegroundColor Red
    
    # Try to find the correct directory
    $possibleDirs = @(
        "d:\safemate-mobile-android",
        "D:\safemate-mobile-android",
        "d:\safemate-mobile-android\",
        "D:\safemate-mobile-android\"
    )
    
    foreach ($dir in $possibleDirs) {
        if (Test-Path $dir) {
            $packageJsonCheck = Join-Path $dir "package.json"
            if (Test-Path $packageJsonCheck) {
                Write-Host "✅ Found correct directory: $dir" -ForegroundColor Green
                Write-Host "Changing to correct directory..." -ForegroundColor Yellow
                Set-Location $dir
                break
            }
        }
    }
}

# Verify final directory
$finalDir = Get-Location
$finalPackageJson = Join-Path $finalDir "package.json"
if (Test-Path $finalPackageJson) {
    Write-Host "✅ Successfully in correct directory: $finalDir" -ForegroundColor Green
} else {
    Write-Host "❌ Still in incorrect directory!" -ForegroundColor Red
    Write-Host "Please manually navigate to: d:\safemate-mobile-android" -ForegroundColor Red
}

Write-Host "`n📋 Directory Status:" -ForegroundColor Cyan
Write-Host "Current: $finalDir" -ForegroundColor White
Write-Host "Expected: d:\safemate-mobile-android" -ForegroundColor White
Write-Host "Package.json found: $(Test-Path $finalPackageJson)" -ForegroundColor White