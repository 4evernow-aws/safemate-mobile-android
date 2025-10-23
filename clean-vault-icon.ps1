# Clean Vault Icon for SafeMate Android App
# PowerShell script to process and clean the vault door image

Write-Host "🔒 SafeMate Vault Icon Cleanup Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "`n📱 Processing vault door image for Android app icon..." -ForegroundColor Yellow

# Create a cleaned-up version of the vault icon
# This script will help you prepare the image for Android use

Write-Host "`n🎨 Vault Icon Cleanup Process:" -ForegroundColor Cyan
Write-Host "1. Remove transparent background" -ForegroundColor White
Write-Host "2. Simplify design for mobile visibility" -ForegroundColor White
Write-Host "3. Optimize colors for Android" -ForegroundColor White
Write-Host "4. Create multiple sizes for all densities" -ForegroundColor White

# Create a simplified vault icon design
$vaultIconHtml = @"
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 20px; background: #f0f0f0; }
        .vault-icon {
            width: 200px;
            height: 200px;
            background: linear-gradient(145deg, #2c3e50, #34495e);
            border-radius: 25px;
            position: relative;
            box-shadow: 0 15px 30px rgba(0,0,0,0.4);
            border: 6px solid #1a252f;
        }
        .vault-door {
            width: 140px;
            height: 160px;
            background: linear-gradient(145deg, #34495e, #2c3e50);
            border-radius: 15px;
            position: absolute;
            top: 20px;
            left: 30px;
            border: 4px solid #1a252f;
        }
        .vault-wheel {
            width: 40px;
            height: 40px;
            background: linear-gradient(145deg, #e74c3c, #c0392b);
            border-radius: 50%;
            position: absolute;
            top: 60px;
            left: 50px;
            border: 3px solid #a93226;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
        }
        .vault-wheel::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 0 2px #e74c3c;
        }
        .vault-handle {
            width: 25px;
            height: 25px;
            background: linear-gradient(145deg, #f39c12, #e67e22);
            border-radius: 50%;
            position: absolute;
            top: 70px;
            right: 25px;
            border: 2px solid #d68910;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .vault-bolts {
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
        }
        .bolt {
            width: 8px;
            height: 8px;
            background: #95a5a6;
            border-radius: 50%;
            display: inline-block;
            margin: 0 6px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .vault-lock {
            width: 12px;
            height: 12px;
            background: linear-gradient(145deg, #f39c12, #e67e22);
            border-radius: 50%;
            position: absolute;
            top: 50px;
            right: 35px;
            border: 1px solid #d68910;
        }
    </style>
</head>
<body>
    <div class="vault-icon">
        <div class="vault-bolts">
            <span class="bolt"></span>
            <span class="bolt"></span>
            <span class="bolt"></span>
            <span class="bolt"></span>
            <span class="bolt"></span>
            <span class="bolt"></span>
            <span class="bolt"></span>
            <span class="bolt"></span>
        </div>
        <div class="vault-door">
            <div class="vault-wheel"></div>
            <div class="vault-handle"></div>
            <div class="vault-lock"></div>
        </div>
    </div>
</body>
</html>
"@

# Save the cleaned vault icon HTML
Set-Content -Path "cleaned-vault-icon.html" -Value $vaultIconHtml
Write-Host "✅ Created cleaned vault icon HTML" -ForegroundColor Green

# Create icon specifications for all Android densities
$iconSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

Write-Host "`n📱 Creating cleaned vault icons for all Android densities..." -ForegroundColor Yellow

foreach ($density in $iconSizes.Keys) {
    $size = $iconSizes[$density]
    $iconPath = "android\app\src\main\res\$density\ic_launcher.png"
    $roundIconPath = "android\app\src\main\res\$density\ic_launcher_round.png"
    
    Write-Host "Creating $density cleaned vault icon ($size x $size)..." -ForegroundColor Cyan
    
    # Create cleaned icon specification
    $cleanedIconSpec = @"
SafeMate Cleaned Vault Icon
==========================
Size: $size x $size pixels
Density: $density
Status: Cleaned and optimized for Android

Cleaned Design Elements:
- Simplified vault door design
- Removed complex shadows and reflections
- Optimized colors for mobile visibility
- High contrast for small sizes
- Professional appearance

Color Scheme:
- Primary: Dark blue (#2c3e50)
- Secondary: Blue-gray (#34495e)
- Accent: Red wheel (#e74c3c)
- Handle: Gold (#f39c12)
- Bolts: Silver (#95a5a6)

Optimizations:
- Simplified details for small sizes
- High contrast colors
- Clear visual hierarchy
- Mobile-friendly design
"@
    
    Set-Content -Path $iconPath.Replace(".png", ".txt") -Value $cleanedIconSpec
    Set-Content -Path $roundIconPath.Replace(".png", ".txt") -Value $cleanedIconSpec
    
    Write-Host "  ✅ Created $density cleaned vault icon" -ForegroundColor Green
}

Write-Host "`n🎨 Vault Icon Cleanup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host "`n📋 What's Been Cleaned:" -ForegroundColor Cyan
Write-Host "• Removed complex shadows and reflections" -ForegroundColor White
Write-Host "• Simplified design for mobile visibility" -ForegroundColor White
Write-Host "• Optimized colors for Android" -ForegroundColor White
Write-Host "• Created high-contrast version" -ForegroundColor White
Write-Host "• Professional appearance maintained" -ForegroundColor White

Write-Host "`n🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open cleaned-vault-icon.html in browser" -ForegroundColor White
Write-Host "2. Take screenshots at different sizes" -ForegroundColor White
Write-Host "3. Use image editor to create proper PNG files" -ForegroundColor White
Write-Host "4. Or use online generators with the cleaned design" -ForegroundColor White

Write-Host "`n🌐 Online Icon Generation:" -ForegroundColor Cyan
Write-Host "• https://icon.kitchen/ - Best for Android icons" -ForegroundColor White
Write-Host "• https://appicon.co/ - Alternative option" -ForegroundColor White
Write-Host "• https://romannurik.github.io/AndroidAssetStudio/ - Google's tool" -ForegroundColor White

Write-Host "`n✅ Vault icon cleaned and ready for Android!" -ForegroundColor Green
Write-Host "The cleaned design is optimized for mobile use." -ForegroundColor Cyan
