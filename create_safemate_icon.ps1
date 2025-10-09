# Create SafeMate Launcher Icon
# This script creates a simple SafeMate icon for the Android app

Add-Type -AssemblyName System.Drawing

# Create a 512x512 icon
$size = 512
$bitmap = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Set high quality
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Background - Blue gradient
$rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(52, 152, 219), [System.Drawing.Color]::FromArgb(41, 128, 185), 45)
$graphics.FillRectangle($brush, $rect)

# Shield shape
$shieldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$shieldPath.AddEllipse(50, 50, $size - 100, $size - 100)

# White shield background
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics.FillPath($whiteBrush, $shieldPath)

# SafeMate text
$font = New-Object System.Drawing.Font("Arial", 80, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(52, 152, 219))
$textRect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center

$graphics.DrawString("🛡️", $font, $textBrush, $textRect, $format)

# Save the icon
$iconPath = "D:\SafeMateAndroid\SafeMateAndroid\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png"
$bitmap.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Create smaller versions
$sizes = @(192, 144, 96, 72, 48, 36)
$folders = @("mipmap-xxxhdpi", "mipmap-xxhdpi", "mipmap-xhdpi", "mipmap-hdpi", "mipmap-mdpi", "mipmap-ldpi")

for ($i = 0; $i -lt $sizes.Length; $i++) {
    $newSize = $sizes[$i]
    $newBitmap = New-Object System.Drawing.Bitmap($newSize, $newSize)
    $newGraphics = [System.Drawing.Graphics]::FromImage($newBitmap)
    $newGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $newGraphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Scale the original image
    $newGraphics.DrawImage($bitmap, 0, 0, $newSize, $newSize)
    
    $folderPath = "D:\SafeMateAndroid\SafeMateAndroid\android\app\src\main\res\$($folders[$i])"
    $newIconPath = "$folderPath\ic_launcher.png"
    $newBitmap.Save($newIconPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Also create round version
    $roundPath = "$folderPath\ic_launcher_round.png"
    $newBitmap.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $newGraphics.Dispose()
    $newBitmap.Dispose()
}

# Cleanup
$graphics.Dispose()
$bitmap.Dispose()
$brush.Dispose()
$whiteBrush.Dispose()
$textBrush.Dispose()
$font.Dispose()

Write-Host "SafeMate launcher icons created successfully!"
Write-Host "Icons saved to all mipmap folders"