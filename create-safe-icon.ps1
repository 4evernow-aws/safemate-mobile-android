# SafeMate Android Safe Icon Creation Script
# PowerShell script to create a safe icon for the Android app

Write-Host "🔒 SafeMate Safe Icon Creation Script" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Create a simple safe icon using HTML/CSS and convert to PNG
$safeIconHtml = @"
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 20px; background: #f0f0f0; }
        .safe-icon {
            width: 200px;
            height: 200px;
            background: linear-gradient(145deg, #2c3e50, #34495e);
            border-radius: 20px;
            position: relative;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
            border: 4px solid #1a252f;
        }
        .safe-door {
            width: 120px;
            height: 140px;
            background: linear-gradient(145deg, #34495e, #2c3e50);
            border-radius: 10px;
            position: absolute;
            top: 30px;
            left: 40px;
            border: 3px solid #1a252f;
        }
        .safe-handle {
            width: 20px;
            height: 20px;
            background: #e74c3c;
            border-radius: 50%;
            position: absolute;
            top: 60px;
            right: 20px;
            border: 2px solid #c0392b;
        }
        .safe-lock {
            width: 8px;
            height: 8px;
            background: #f39c12;
            border-radius: 50%;
            position: absolute;
            top: 50px;
            right: 30px;
        }
        .safe-bolts {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
        }
        .bolt {
            width: 6px;
            height: 6px;
            background: #95a5a6;
            border-radius: 50%;
            display: inline-block;
            margin: 0 8px;
        }
    </style>
</head>
<body>
    <div class="safe-icon">
        <div class="safe-bolts">
            <span class="bolt"></span>
            <span class="bolt"></span>
            <span class="bolt"></span>
            <span class="bolt"></span>
            <span class="bolt"></span>
            <span class="bolt"></span>
        </div>
        <div class="safe-door">
            <div class="safe-handle"></div>
            <div class="safe-lock"></div>
        </div>
    </div>
</body>
</html>
"@

# Save HTML file
$htmlFile = "safe-icon.html"
Set-Content -Path $htmlFile -Value $safeIconHtml
Write-Host "✅ Created safe icon HTML template" -ForegroundColor Green

# Create a simple PNG icon using PowerShell (basic approach)
Write-Host "`n📱 Creating Android app icons..." -ForegroundColor Yellow

# Create a simple text-based icon as a fallback
$iconSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($density in $iconSizes.Keys) {
    $size = $iconSizes[$density]
    $iconPath = "android\app\src\main\res\$density\ic_launcher.png"
    
    # Create a simple colored square as a placeholder
    # In a real scenario, you would use ImageMagick or similar tool
    Write-Host "Creating $density icon ($size x $size)..." -ForegroundColor Cyan
    
    # For now, create a simple text file that represents the icon
    $iconContent = @"
SafeMate Icon
Size: $size x $size
Density: $density
Color: Dark Blue (#2c3e50)
Shape: Safe/Vault
"@
    
    Set-Content -Path $iconPath.Replace(".png", ".txt") -Value $iconContent
}

Write-Host "`n🎨 Safe Icon Design:" -ForegroundColor Green
Write-Host "• Shape: Safe/Vault with door and handle" -ForegroundColor White
Write-Host "• Color: Dark blue gradient (#2c3e50 to #34495e)" -ForegroundColor White
Write-Host "• Style: Modern, secure, professional" -ForegroundColor White
Write-Host "• Elements: Safe door, handle, lock, bolts" -ForegroundColor White

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open the HTML file in a browser to see the icon design" -ForegroundColor White
Write-Host "2. Take a screenshot and resize to required dimensions" -ForegroundColor White
Write-Host "3. Save as PNG files in the mipmap directories" -ForegroundColor White
Write-Host "4. Or use an online icon generator with the design" -ForegroundColor White

Write-Host "`n🔧 Alternative: Use Online Icon Generator" -ForegroundColor Yellow
Write-Host "• Go to: https://icon.kitchen/" -ForegroundColor Cyan
Write-Host "• Upload a safe image or use their safe icon" -ForegroundColor Cyan
Write-Host "• Generate Android icons in all required sizes" -ForegroundColor Cyan
Write-Host "• Download and place in mipmap directories" -ForegroundColor Cyan

Write-Host "`n📱 Icon Requirements:" -ForegroundColor Green
Write-Host "• mdpi: 48x48px" -ForegroundColor White
Write-Host "• hdpi: 72x72px" -ForegroundColor White
Write-Host "• xhdpi: 96x96px" -ForegroundColor White
Write-Host "• xxhdpi: 144x144px" -ForegroundColor White
Write-Host "• xxxhdpi: 192x192px" -ForegroundColor White

Write-Host "`n✅ Safe icon template created!" -ForegroundColor Green
Write-Host "Open $htmlFile in your browser to see the safe icon design." -ForegroundColor Cyan
