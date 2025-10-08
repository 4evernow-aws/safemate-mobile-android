# Very basic SafeMate icon creator
Add-Type -AssemblyName System.Drawing

function Create-BasicIcon {
    param([int]$Size)
    
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Blue background
    $blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(52, 152, 219))
    $graphics.FillRectangle($blueBrush, 0, 0, $Size, $Size)
    
    # White "S" in center
    $font = New-Object System.Drawing.Font("Arial", [int]($Size / 2), [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $textSize = $graphics.MeasureString("S", $font)
    $textX = ($Size - $textSize.Width) / 2
    $textY = ($Size - $textSize.Height) / 2
    $graphics.DrawString("S", $font, $whiteBrush, $textX, $textY)
    
    # Cleanup
    $graphics.Dispose()
    $blueBrush.Dispose()
    $font.Dispose()
    $whiteBrush.Dispose()
    
    return $bitmap
}

# Create icons for all densities
$densities = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($density in $densities.Keys) {
    $size = $densities[$density]
    $icon = Create-BasicIcon -Size $size
    
    $regularPath = "android\app\src\main\res\$density\ic_launcher.png"
    $roundPath = "android\app\src\main\res\$density\ic_launcher_round.png"
    
    $icon.Save($regularPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $icon.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $icon.Dispose()
    Write-Host "Created $density icons ($size x $size)"
}

Write-Host "SafeMate basic icons created successfully!"
