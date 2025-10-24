# PowerShell script to create SafeMate safe icon
# This creates a simple but effective safe icon

Add-Type -AssemblyName System.Drawing

# Function to create a safe icon
function Create-SafeIcon {
    param(
        [int]$Size
    )
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Set high quality rendering
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Background - Blue gradient
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(52, 152, 219), [System.Drawing.Color]::FromArgb(41, 128, 185), 45)
    $graphics.FillRectangle($brush, $rect)
    
    # Safe body (rounded rectangle)
    $safeWidth = $Size * 0.7
    $safeHeight = $Size * 0.8
    $safeX = ($Size - $safeWidth) / 2
    $safeY = ($Size - $safeHeight) / 2
    
    $safeRect = New-Object System.Drawing.RectangleF($safeX, $safeY, $safeWidth, $safeHeight)
    
    # Fill safe with white
    $graphics.FillRectangle([System.Drawing.Brushes]::White, $safeRect)
    
    # Draw safe border
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(52, 152, 219), 3)
    $graphics.DrawRectangle($pen, $safeRect)
    
    # Safe door handle
    $handleSize = $Size * 0.15
    $handleX = $safeX + $safeWidth * 0.3
    $handleY = $safeY + $safeHeight * 0.4
    $handleRect = New-Object System.Drawing.RectangleF($handleX, $handleY, $handleSize, $handleSize)
    
    # Draw handle circle
    $graphics.FillEllipse([System.Drawing.Brushes]::FromArgb(52, 152, 219), $handleRect)
    
    # Safe keyhole
    $keyholeSize = $Size * 0.08
    $keyholeX = $safeX + $safeWidth * 0.6
    $keyholeY = $safeY + $safeHeight * 0.45
    $keyholeRect = New-Object System.Drawing.RectangleF($keyholeX, $keyholeY, $keyholeSize, $keyholeSize)
    
    # Draw keyhole
    $graphics.FillEllipse([System.Drawing.Brushes]::FromArgb(52, 152, 219), $keyholeRect)
    
    # Add "S" text for SafeMate
    $fontSize = [int]($Size / 6)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(52, 152, 219))
    $textSize = $graphics.MeasureString("S", $font)
    $textX = ($Size - $textSize.Width) / 2
    $textY = $safeY + $safeHeight * 0.2 - $textSize.Height / 2
    $graphics.DrawString("S", $font, $textBrush, $textX, $textY)
    
    # Clean up
    $graphics.Dispose()
    $brush.Dispose()
    $pen.Dispose()
    $font.Dispose()
    $textBrush.Dispose()
    
    return $bitmap
}

# Create icons for different densities
$densities = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

Write-Host "Creating SafeMate safe icons..."

foreach ($density in $densities.Keys) {
    $size = $densities[$density]
    $icon = Create-SafeIcon -Size $size
    
    # Save regular icon
    $regularPath = "android\app\src\main\res\$density\ic_launcher.png"
    $icon.Save($regularPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Save round icon (same as regular for now)
    $roundPath = "android\app\src\main\res\$density\ic_launcher_round.png"
    $icon.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $icon.Dispose()
    Write-Host "Created $density icons ($size x $size)"
}

Write-Host "SafeMate safe icons created successfully!"
Write-Host "The app should now show the SafeMate safe icon in the Android launcher."
