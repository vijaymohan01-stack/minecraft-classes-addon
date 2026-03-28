#!/usr/bin/env python3
"""
Package the FFA Class System as an .mcaddon file.
Creates pack_icon.png for both packs, then zips BP + RP into a single .mcaddon.
"""
import struct, zlib, os, zipfile

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BP_DIR = os.path.join(BASE_DIR, 'BP')
RP_DIR = os.path.join(BASE_DIR, 'RP')
OUTPUT = os.path.join(BASE_DIR, 'FFA_Classes_v2.mcaddon')

def create_pack_icon(filepath, color):
    """Create a simple 64x64 colored pack icon."""
    width, height = 64, 64
    r0, g0, b0 = color
    rawdata = b''
    for y in range(height):
        rawdata += b'\x00'
        for x in range(width):
            # Gradient effect
            factor = 1.0 - (y / height) * 0.3
            r = int(r0 * factor)
            g = int(g0 * factor)
            b = int(b0 * factor)
            # Border
            if x < 2 or x >= width-2 or y < 2 or y >= height-2:
                r, g, b = 30, 30, 30
            rawdata += struct.pack('BBBB', r, g, b, 255)

    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xffffffff)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    compressed = zlib.compress(rawdata)
    png = header + make_chunk(b'IHDR', ihdr) + make_chunk(b'IDAT', compressed) + make_chunk(b'IEND', b'')

    with open(filepath, 'wb') as f:
        f.write(png)
    print(f'Created icon: {filepath}')

# Create pack icons
create_pack_icon(os.path.join(BP_DIR, 'pack_icon.png'), (50, 130, 200))
create_pack_icon(os.path.join(RP_DIR, 'pack_icon.png'), (200, 80, 50))

# Package as .mcaddon (zip containing BP.mcpack + RP.mcpack)
def zip_directory(source_dir, zip_path):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zf.write(file_path, arcname)
    print(f'Packed: {zip_path}')

# Create individual .mcpack files
bp_pack = os.path.join(BASE_DIR, 'FFA_Class_System_BP.mcpack')
rp_pack = os.path.join(BASE_DIR, 'FFA_Class_System_RP.mcpack')
zip_directory(BP_DIR, bp_pack)
zip_directory(RP_DIR, rp_pack)

# Create .mcaddon (zip of both .mcpack files)
with zipfile.ZipFile(OUTPUT, 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.write(bp_pack, 'FFA_Class_System_BP.mcpack')
    zf.write(rp_pack, 'FFA_Class_System_RP.mcpack')

# Clean up individual mcpack files
os.remove(bp_pack)
os.remove(rp_pack)

print(f'\n✅ Add-on packaged: {OUTPUT}')
print(f'   Transfer this file to your iPad and tap to import into Minecraft.')
