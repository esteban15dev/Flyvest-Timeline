import zlib
import struct
import math
import os

def create_png(width, height, draw_func, filepath):
    # RGBA raw data
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    # PNG signature
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc))
    
    # IDAT chunk
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc))
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc))
    
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    with open(filepath, 'wb') as f:
        f.write(png)
    print(f"Generated: {filepath} ({width}x{height})")

def is_point_in_poly(x, y, poly):
    n = len(poly)
    inside = False
    p1x, p1y = poly[0]
    for i in range(n + 1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

def dist_to_segment(px, py, x1, y1, x2, y2):
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(px - x1, py - y1)
    t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    closest_x = x1 + t * dx
    closest_y = y1 + t * dy
    return math.hypot(px - closest_x, py - closest_y)

def dist_to_poly_outline(px, py, poly):
    min_d = float('inf')
    n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % n]
        d = dist_to_segment(px, py, x1, y1, x2, y2)
        if d < min_d:
            min_d = d
    return min_d

def draw_flyvest_icon(x, y, width, height, maskable=False):
    # Normalized coords [0, 1]
    nx = x / (width - 1)
    ny = y / (height - 1)
    
    # Center and radius for background rounded rect
    cx, cy = 0.5, 0.5
    
    # Background corner radius
    r_corner = 0.22 if not maskable else 0.0
    
    # Distance to rounded rect border
    dx = max(abs(nx - 0.5) - (0.46 - r_corner), 0)
    dy = max(abs(ny - 0.5) - (0.46 - r_corner), 0)
    d_corner = math.hypot(dx, dy)
    
    if not maskable and d_corner > r_corner:
        # Transparent outside rounded rect
        return (0, 0, 0, 0)
    
    # Background gradient from top-left (#16161f) to bottom-right (#0a0a0f)
    t_bg = (nx + ny) / 2.0
    bg_r = int(22 * (1 - t_bg) + 10 * t_bg)
    bg_g = int(22 * (1 - t_bg) + 10 * t_bg)
    bg_b = int(31 * (1 - t_bg) + 15 * t_bg)
    
    # Border stroke (subtle cyan/purple)
    if not maskable and d_corner >= r_corner - 0.02:
        return (99, 179, 237, 255)
        
    # Ambient glow in center
    dist_center = math.hypot(nx - 0.5, ny - 0.5)
    glow_intensity = max(0.0, 1.0 - dist_center / 0.45)
    bg_r = min(255, int(bg_r + 40 * glow_intensity))
    bg_g = min(255, int(bg_g + 50 * glow_intensity))
    bg_b = min(255, int(bg_b + 90 * glow_intensity))
    
    # Lightning Bolt Polygon scaled to [0, 1]
    # Standard coords: (285, 85), (165, 270), (250, 270), (215, 427), (355, 225), (280, 225)
    poly = [
        (0.555, 0.165),
        (0.320, 0.525),
        (0.485, 0.525),
        (0.420, 0.835),
        (0.690, 0.440),
        (0.545, 0.440),
    ]
    
    # Check if point is inside lightning bolt
    inside_bolt = is_point_in_poly(nx, ny, poly)
    d_outline = dist_to_poly_outline(nx, ny, poly)
    
    if inside_bolt:
        # Gradient along bolt (top: cyan #63b3ed -> middle: teal #38b2ac -> bottom: purple #805ad5)
        t_bolt = (ny - 0.165) / (0.835 - 0.165)
        t_bolt = max(0.0, min(1.0, t_bolt))
        if t_bolt < 0.5:
            k = t_bolt / 0.5
            r = int(99 * (1 - k) + 56 * k)
            g = int(179 * (1 - k) + 178 * k)
            b = int(237 * (1 - k) + 172 * k)
        else:
            k = (t_bolt - 0.5) / 0.5
            r = int(56 * (1 - k) + 128 * k)
            g = int(178 * (1 - k) + 90 * k)
            b = int(172 * (1 - k) + 213 * k)
            
        # White highlight along top-left
        if d_outline < 0.012:
            return (255, 255, 255, 255)
        return (r, g, b, 255)
    elif d_outline < 0.025:
        # Outer glow ring
        glow_alpha = (1.0 - d_outline / 0.025)
        r = int(bg_r * (1 - glow_alpha) + 99 * glow_alpha)
        g = int(bg_g * (1 - glow_alpha) + 179 * glow_alpha)
        b = int(bg_b * (1 - glow_alpha) + 237 * glow_alpha)
        return (r, g, b, 255)
        
    return (bg_r, bg_g, bg_b, 255)

if __name__ == '__main__':
    create_png(192, 192, lambda x, y, w, h: draw_flyvest_icon(x, y, w, h, False), 'icons/icon-192.png')
    create_png(512, 512, lambda x, y, w, h: draw_flyvest_icon(x, y, w, h, False), 'icons/icon-512.png')
    create_png(512, 512, lambda x, y, w, h: draw_flyvest_icon(x, y, w, h, True), 'icons/icon-maskable.png')
    create_png(180, 180, lambda x, y, w, h: draw_flyvest_icon(x, y, w, h, False), 'icons/apple-touch-icon.png')
    print("All icons generated successfully.")
