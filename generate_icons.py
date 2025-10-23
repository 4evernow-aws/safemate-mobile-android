#!/usr/bin/env python3
"""
Generate SafeMate app icons in different Android sizes
"""
import os
from PIL import Image, ImageDraw
import math

def create_safemate_icon(size):
    """Create a SafeMate icon at the specified size"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate dimensions based on size
    center = size // 2
    radius = int(size * 0.45)
    shield_width = int(size * 0.6)
    shield_height = int(size * 0.7)
    
    # Background circle (blue gradient effect)
    draw.ellipse([center - radius, center - radius, center + radius, center + radius], 
                 fill=(74, 144, 226, 255), outline=(30, 58, 138, 255), width=max(2, size//64))
    
    # Shield shape
    shield_left = center - shield_width // 2
    shield_right = center + shield_width // 2
    shield_top = center - shield_height // 2
    shield_bottom = center + shield_height // 2
    
    # Shield points
    shield_points = [
        (center, shield_top),  # Top point
        (shield_left, shield_top + shield_height // 4),  # Left upper
        (shield_left, shield_bottom - shield_height // 4),  # Left lower
        (center, shield_bottom),  # Bottom point
        (shield_right, shield_bottom - shield_height // 4),  # Right lower
        (shield_right, shield_top + shield_height // 4),  # Right upper
    ]
    
    draw.polygon(shield_points, fill=(255, 255, 255, 255), outline=(46, 91, 186, 255), width=max(1, size//128))
    
    # Lock inside shield
    lock_width = int(size * 0.15)
    lock_height = int(size * 0.2)
    lock_x = center - lock_width // 2
    lock_y = center - lock_height // 4
    
    # Lock body
    draw.rectangle([lock_x, lock_y, lock_x + lock_width, lock_y + lock_height], 
                   fill=(46, 91, 186, 255), outline=(46, 91, 186, 255))
    
    # Lock shackle
    shackle_width = int(size * 0.08)
    shackle_height = int(size * 0.1)
    shackle_x = center - shackle_width // 2
    shackle_y = lock_y - shackle_height
    
    draw.rectangle([shackle_x, shackle_y, shackle_x + shackle_width, shackle_y + shackle_height], 
                   fill=(46, 91, 186, 255), outline=(46, 91, 186, 255))
    
    # Lock keyhole
    keyhole_radius = max(2, size // 64)
    draw.ellipse([center - keyhole_radius, lock_y + lock_height // 2 - keyhole_radius, 
                  center + keyhole_radius, lock_y + lock_height // 2 + keyhole_radius], 
                 fill=(255, 255, 255, 255))
    
    # "S" letter
    font_size = int(size * 0.15)
    try:
        from PIL import ImageFont
        # Try to use a system font
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
    
    # Draw "S" letter
    s_text = "S"
    bbox = draw.textbbox((0, 0), s_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = center - text_width // 2
    text_y = center + shield_height // 4 - text_height // 2
    
    draw.text((text_x, text_y), s_text, fill=(46, 91, 186, 255), font=font)
    
    return img

def main():
    """Generate icons for all Android densities"""
    densities = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192
    }
    
    base_path = "android/app/src/main/res"
    
    for density, size in densities.items():
        density_path = os.path.join(base_path, density)
        os.makedirs(density_path, exist_ok=True)
        
        # Generate regular icon
        icon = create_safemate_icon(size)
        icon.save(os.path.join(density_path, "ic_launcher.png"))
        
        # Generate round icon (same as regular for now)
        icon.save(os.path.join(density_path, "ic_launcher_round.png"))
        
        print(f"Generated {density} icons ({size}x{size})")

if __name__ == "__main__":
    main()
