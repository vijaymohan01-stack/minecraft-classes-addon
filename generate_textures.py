#!/usr/bin/env python3
"""Generate 16x16 pixel art textures for FFA Class System items."""
import struct
import zlib
import os

TEXTURE_DIR = os.path.join(os.path.dirname(__file__), "RP", "textures", "items")

def create_png_16x16(pixels):
    """Create a 16x16 RGBA PNG from a flat list of (r, g, b, a) tuples."""
    width, height = 16, 16
    
    # Build raw image data with filter bytes
    raw_data = b""
    for y in range(height):
        raw_data += b"\x00"  # No filter
        for x in range(width):
            idx = y * width + x
            if idx < len(pixels):
                r, g, b, a = pixels[idx]
            else:
                r, g, b, a = 0, 0, 0, 0
            raw_data += struct.pack("BBBB", r, g, b, a)
    
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        crc = struct.pack(">I", zlib.crc32(chunk) & 0xFFFFFFFF)
        return struct.pack(">I", len(data)) + chunk + crc
    
    # PNG signature
    signature = b"\x89PNG\r\n\x1a\n"
    
    # IHDR
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = make_chunk(b"IHDR", ihdr_data)
    
    # IDAT
    compressed = zlib.compress(raw_data, 9)
    idat = make_chunk(b"IDAT", compressed)
    
    # IEND
    iend = make_chunk(b"IEND", b"")
    
    return signature + ihdr + idat + iend

def fill(color, alpha=255):
    """Create a 16x16 grid filled with transparent."""
    return [(0, 0, 0, 0)] * 256

def set_pixel(pixels, x, y, r, g, b, a=255):
    """Set a pixel at (x, y)."""
    if 0 <= x < 16 and 0 <= y < 16:
        pixels[y * 16 + x] = (r, g, b, a)

def draw_rect(pixels, x1, y1, x2, y2, r, g, b, a=255):
    """Draw a filled rectangle."""
    for y in range(y1, y2 + 1):
        for x in range(x1, x2 + 1):
            set_pixel(pixels, x, y, r, g, b, a)

def draw_line_diag(pixels, x1, y1, x2, y2, r, g, b, a=255):
    """Draw a simple diagonal line."""
    dx = abs(x2 - x1)
    dy = abs(y2 - y1)
    steps = max(dx, dy)
    if steps == 0:
        set_pixel(pixels, x1, y1, r, g, b, a)
        return
    for i in range(steps + 1):
        x = x1 + int((x2 - x1) * i / steps)
        y = y1 + int((y2 - y1) * i / steps)
        set_pixel(pixels, x, y, r, g, b, a)

# ── PICKAXE TEXTURES ──

def make_pickaxe(head_color, handle_color=(139, 90, 43)):
    """Pickaxe: diagonal handle with a pick head at top-right."""
    px = fill(None)
    hr, hg, hb = handle_color
    cr, cg, cb = head_color
    
    # Handle (diagonal from bottom-left to middle)
    for i in range(8):
        set_pixel(px, 3 + i, 14 - i, hr, hg, hb)
        set_pixel(px, 4 + i, 14 - i, hr, hg, hb)
    
    # Pick head (horizontal bar at top)
    for x in range(7, 15):
        set_pixel(px, x, 4, cr, cg, cb)
        set_pixel(px, x, 5, cr, cg, cb)
    
    # Pick head curves down at ends
    set_pixel(px, 7, 6, cr, cg, cb)
    set_pixel(px, 14, 6, cr, cg, cb)
    set_pixel(px, 7, 7, cr, cg, cb)
    set_pixel(px, 14, 7, cr, cg, cb)
    
    # Highlight on head
    for x in range(8, 14):
        set_pixel(px, x, 4, min(cr+40, 255), min(cg+40, 255), min(cb+40, 255))
    
    return px

# ── WAND TEXTURES ──

def make_wand(tip_color, shaft_color=(180, 140, 80)):
    """Wand: vertical stick with glowing tip."""
    px = fill(None)
    sr, sg, sb = shaft_color
    tr, tg, tb = tip_color
    
    # Shaft
    for y in range(5, 15):
        set_pixel(px, 7, y, sr, sg, sb)
        set_pixel(px, 8, y, sr, sg, sb)
    
    # Handle wrap
    for y in range(12, 15):
        set_pixel(px, 7, y, sr - 30, sg - 30, sb - 30)
        set_pixel(px, 8, y, sr - 30, sg - 30, sb - 30)
    
    # Tip glow (3x3 + extra)
    for dy in range(-1, 2):
        for dx in range(-1, 2):
            set_pixel(px, 7 + dx, 3 + dy, tr, tg, tb)
    set_pixel(px, 7, 1, tr, tg, tb, 180)
    set_pixel(px, 9, 3, tr, tg, tb, 180)
    set_pixel(px, 5, 3, tr, tg, tb, 180)
    set_pixel(px, 7, 5, tr, tg, tb, 180)
    
    # Star sparkle
    set_pixel(px, 7, 0, 255, 255, 255, 120)
    set_pixel(px, 10, 3, 255, 255, 255, 120)
    set_pixel(px, 4, 3, 255, 255, 255, 120)
    
    return px

# ── BROADSWORD TEXTURES ──

def make_broadsword(blade_color, accent_color=None):
    """Broadsword: wide blade with crossguard."""
    px = fill(None)
    br, bg, bb = blade_color
    
    # Blade (wide, goes up diagonally)
    for i in range(9):
        x = 5 + i
        y = 12 - i
        set_pixel(px, x, y, br, bg, bb)
        set_pixel(px, x + 1, y, br, bg, bb)
        set_pixel(px, x, y - 1, br, bg, bb)
        # Highlight edge
        set_pixel(px, x + 1, y - 1, min(br + 50, 255), min(bg + 50, 255), min(bb + 50, 255))
    
    # Blade tip
    set_pixel(px, 14, 2, min(br + 60, 255), min(bg + 60, 255), min(bb + 60, 255))
    set_pixel(px, 15, 1, min(br + 60, 255), min(bg + 60, 255), min(bb + 60, 255))
    
    # Crossguard
    for x in range(3, 9):
        set_pixel(px, x, 12, 80, 80, 80)
        set_pixel(px, x, 13, 60, 60, 60)
    
    # Handle
    set_pixel(px, 4, 14, 139, 90, 43)
    set_pixel(px, 5, 14, 139, 90, 43)
    set_pixel(px, 3, 15, 139, 90, 43)
    set_pixel(px, 4, 15, 139, 90, 43)
    
    # Accent on blade if provided
    if accent_color:
        ar, ag, ab = accent_color
        for i in range(0, 9, 2):
            x = 6 + i
            y = 11 - i
            set_pixel(px, x, y, ar, ag, ab)
    
    return px

# ── SHIELD TEXTURE ──

def make_shield():
    """Shield: front-facing shield shape."""
    px = fill(None)
    
    # Shield body (dark red)
    for y in range(2, 14):
        width = 5
        if y < 4:
            width = 3 + (y - 2)
        elif y > 10:
            width = 5 - (y - 10)
        for x in range(-width, width + 1):
            set_pixel(px, 8 + x, y, 160, 40, 40)
    
    # Border (gold)
    for y in range(2, 14):
        width = 5
        if y < 4:
            width = 3 + (y - 2)
        elif y > 10:
            width = 5 - (y - 10)
        if width > 0:
            set_pixel(px, 8 - width, y, 218, 165, 32)
            set_pixel(px, 8 + width, y, 218, 165, 32)
    # Top border
    for x in range(-3, 4):
        set_pixel(px, 8 + x, 2, 218, 165, 32)
    # Bottom
    set_pixel(px, 8, 13, 218, 165, 32)
    
    # Cross emblem (gold)
    for y in range(4, 11):
        set_pixel(px, 8, y, 255, 200, 50)
    for x in range(6, 11):
        set_pixel(px, x, 7, 255, 200, 50)
    
    return px

# ── GENERATE ALL TEXTURES ──

textures = {
    # Dwarf pickaxes
    "dwarf_pickaxe_base": make_pickaxe((139, 139, 139)),       # Stone gray
    "dwarf_pickaxe_iron": make_pickaxe((200, 200, 200)),       # Iron white
    "dwarf_pickaxe_gold": make_pickaxe((255, 215, 0)),         # Gold
    "dwarf_pickaxe_diamond": make_pickaxe((80, 200, 220)),     # Diamond blue
    "dwarf_pickaxe_netherite": make_pickaxe((70, 60, 65)),     # Dark netherite
    
    # Wizard wands
    "basic_wand": make_wand((170, 100, 220)),                  # Purple
    "teleport_wand": make_wand((130, 70, 200)),                # Dark purple
    "storm_wand": make_wand((100, 150, 255)),                  # Blue
    "fire_wand": make_wand((255, 100, 30)),                    # Orange-red
    "nova_wand": make_wand((255, 200, 255)),                   # Pink/white
    
    # Warrior broadswords
    "heavy_broadsword": make_broadsword((180, 180, 190)),                        # Silver
    "broadsword_knockback": make_broadsword((180, 180, 190), (200, 200, 255)),   # Silver + blue
    "broadsword_fire": make_broadsword((180, 180, 190), (255, 120, 30)),         # Silver + orange
    "broadsword_dash": make_broadsword((180, 180, 190), (100, 255, 100)),        # Silver + green
    "broadsword_leech": make_broadsword((180, 180, 190), (180, 30, 30)),         # Silver + dark red
    
    # Shield
    "warrior_shield": make_shield(),
}

os.makedirs(TEXTURE_DIR, exist_ok=True)

for name, pixels in textures.items():
    png_data = create_png_16x16(pixels)
    path = os.path.join(TEXTURE_DIR, f"{name}.png")
    with open(path, "wb") as f:
        f.write(png_data)
    print(f"✓ {name}.png ({len(png_data)} bytes)")

print(f"\nDone! Generated {len(textures)} textures in {TEXTURE_DIR}")
