# PowerShell script to create SafeMate app icons
# This creates a simple but effective SafeMate icon with shield and lock

Add-Type -AssemblyName System.Drawing

# Function to create a SafeMate icon
function Create-SafeMateIcon {
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
    
    # Shield shape
    $shieldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shieldWidth = $Size * 0.7
    $shieldHeight = $Size * 0.8
    $shieldX = ($Size - $shieldWidth) / 2
    $shieldY = ($Size - $shieldHeight) / 2
    
    # Create shield points
    $points = @(
        [System.Drawing.PointF]::new($shieldX + $shieldWidth/2, $shieldY),  # Top center
        [System.Drawing.PointF]::new($shieldX + $shieldWidth, $shieldY + $shieldHeight/3),  # Top right
        [System.Drawing.PointF]::new($shieldX + $shieldWidth, $shieldY + $shieldHeight*2/3),  # Bottom right
        [System.Drawing.PointF]::new($shieldX + $shieldWidth/2, $shieldY + $shieldHeight),  # Bottom center
        [System.Drawing.PointF]::new($shieldX, $shieldY + $shieldHeight*2/3),  # Bottom left
        [System.Drawing.PointF]::new($shieldX, $shieldY + $shieldHeight/3)   # Top left
    )
    $shieldPath.AddPolygon($points)
    
    # Fill shield with white
    $graphics.FillPath([System.Drawing.Brushes]::White, $shieldPath)
    
    # Draw shield border
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(52, 152, 219), 2)
    $graphics.DrawPath($pen, $shieldPath)
    
    # Lock in center of shield
    $lockSize = $Size * 0.25
    $lockX = $shieldX + ($shieldWidth - $lockSize) / 2
    $lockY = $shieldY + ($shieldHeight - $lockSize) / 2
    
    # Lock body
    $lockRect = New-Object System.Drawing.RectangleF($lockX, $lockY + $lockSize/3, $lockSize, $lockSize*2/3)
    $graphics.FillRectangle([System.Drawing.Brushes]::FromArgb(52, 152, 219), $lockRect)
    
    # Lock shackle
    $shackleRect = New-Object System.Drawing.RectangleF($lockX + $lockSize/4, $lockY, $lockSize/2, $lockSize/2)
    $graphics.DrawArc([System.Drawing.Pens]::FromArgb(52, 152, 219), $shackleRect, 0, 180)
    
    # Add "S" text
    $font = New-Object System.Drawing.Font("Arial", $Size/6, [System.Drawing.FontStyle]::Bold)
    $textBrush = [System.Drawing.Brushes]::FromArgb(52, 152, 219)
    $textSize = $graphics.MeasureString("S", $font)
    $textX = ($Size - $textSize.Width) / 2
    $textY = $shieldY + $shieldHeight/4 - $textSize.Height/2
    $graphics.DrawString("S", $font, $textBrush, $textX, $textY)
    
    # Clean up
    $graphics.Dispose()
    $brush.Dispose()
    $pen.Dispose()
    $font.Dispose()
    
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

foreach ($density in $densities.Keys) {
    $size = $densities[$density]
    $icon = Create-SafeMateIcon -Size $size
    
    # Save regular icon
    $regularPath = "android\app\src\main\res\$density\ic_launcher.png"
    $icon.Save($regularPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Save round icon (same as regular for now)
    $roundPath = "android\app\src\main\res\$density\ic_launcher_round.png"
    $icon.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $icon.Dispose()
    Write-Host "Created $density icons ($size x $size)"
}

Write-Host "SafeMate app icons created successfully!"
Write-Host "The app should now show the SafeMate shield icon in the Android launcher."
