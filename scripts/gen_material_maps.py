#!/usr/bin/env python3
"""Generate shared normal/roughness maps for non-wood materials."""
from __future__ import annotations

import math
import os
import random
from PIL import Image, ImageEnhance, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..', 'img')
OUT = os.path.join(ROOT, 'material')


def luma_img(im: Image.Image) -> Image.Image:
    return im.convert('L')


def height_to_normal(gray: Image.Image, strength: float = 2.0) -> Image.Image:
    w, h = gray.size
    px = gray.load()
    out_im = Image.new('RGB', (w, h))
    op = out_im.load()
    for y in range(h):
        ym = (y - 1) % h
        yp = (y + 1) % h
        for x in range(w):
            xm = (x - 1) % w
            xp = (x + 1) % w
            dx = (px[xp, y] - px[xm, y]) * 0.5 * strength
            dy = (px[x, yp] - px[x, ym]) * 0.5 * strength
            nx, ny, nz = -dx, -dy, 255.0
            inv = 1.0 / math.sqrt(nx * nx + ny * ny + nz * nz)
            r = int((nx * inv * 0.5 + 0.5) * 255)
            g = int((ny * inv * 0.5 + 0.5) * 255)
            b = int((nz * inv * 0.5 + 0.5) * 255)
            op[x, y] = (max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b)))
    return out_im


def roughness_from_gray(
    gray: Image.Image,
    base: float = 0.55,
    amp: float = 0.3,
    invert: bool = False,
) -> Image.Image:
    w, h = gray.size
    px = gray.load()
    mn, mx = 255, 0
    for y in range(h):
        for x in range(w):
            v = px[x, y]
            if v < mn:
                mn = v
            if v > mx:
                mx = v
    span = max(mx - mn, 1)
    out_im = Image.new('RGB', (w, h))
    op = out_im.load()
    for y in range(h):
        for x in range(w):
            t = (px[x, y] - mn) / span
            if invert:
                t = 1.0 - t
            r = base + (t - 0.5) * 2 * amp
            r = 0.05 if r < 0.05 else (0.95 if r > 0.95 else r)
            g = int(r * 255)
            op[x, y] = (g, g, g)
    return out_im


def resize_sq(im: Image.Image, size: int = 512) -> Image.Image:
    return im.convert('RGB').resize((size, size), Image.Resampling.LANCZOS)


def save_pack(name: str, nrm: Image.Image, rgh: Image.Image) -> None:
    nrm.save(os.path.join(OUT, f'{name}_normal.jpg'), quality=92)
    rgh.save(os.path.join(OUT, f'{name}_roughness.jpg'), quality=92)
    print('wrote', name)


def gen_from_albedo(
    src_rel: str,
    name: str,
    strength: float = 2.2,
    rough_base: float = 0.55,
    rough_amp: float = 0.3,
    blur: float = 0,
    contrast: float = 1.2,
    invert_rough: bool = False,
    size: int = 512,
) -> None:
    im = resize_sq(Image.open(os.path.join(ROOT, src_rel)), size)
    if contrast != 1.0:
        im = ImageEnhance.Contrast(im).enhance(contrast)
    gray = luma_img(im)
    if blur > 0:
        gray = gray.filter(ImageFilter.GaussianBlur(blur))
    nrm = height_to_normal(gray, strength=strength)
    rgh = roughness_from_gray(gray, base=rough_base, amp=rough_amp, invert=invert_rough)
    save_pack(name, nrm, rgh)


def gen_brushed_metal(name: str = 'metal', size: int = 512) -> None:
    random.seed(42)
    noise = Image.new('L', (size, size))
    px = noise.load()
    for y in range(size):
        for x in range(size):
            px[x, y] = int(max(0, min(255, 128 + random.gauss(0, 40))))
    streaks = noise.resize((size, max(8, size // 32)), Image.Resampling.BILINEAR)
    streaks = streaks.resize((size, size), Image.Resampling.BILINEAR)
    streaks = ImageEnhance.Contrast(streaks).enhance(1.6)
    fine = noise.filter(ImageFilter.GaussianBlur(0.6))
    gray = Image.blend(streaks, fine, 0.25)
    nrm = height_to_normal(gray, strength=1.8)
    rgh = roughness_from_gray(gray, base=0.25, amp=0.18, invert=False)
    save_pack(name, nrm, rgh)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    # fabric / upholstery
    gen_from_albedo(
        'sofa/sofa0.jpg', 'fabric',
        strength=3.2, rough_base=0.8, rough_amp=0.16, contrast=1.4,
    )
    # hard plastic / painted appliance shell
    gen_from_albedo(
        'TV/TV.jpg', 'plastic',
        strength=1.5, rough_base=0.4, rough_amp=0.22, blur=0.5,
        contrast=1.15, invert_rough=True,
    )
    # glazed ceramic
    gen_from_albedo(
        'others/vase.jpg', 'ceramic',
        strength=1.8, rough_base=0.28, rough_amp=0.2, blur=0.8,
        contrast=1.1, invert_rough=True,
    )
    # paper / printed matter
    gen_from_albedo(
        'others/books.jpg', 'paper',
        strength=1.6, rough_base=0.82, rough_amp=0.12, contrast=1.2,
    )
    # wall plaster / wallpaper micro-relief
    gen_from_albedo(
        'wall/wall0.jpg', 'plaster',
        strength=1.2, rough_base=0.75, rough_amp=0.12, blur=1.0, contrast=1.1,
    )
    # ceiling slightly smoother
    gen_from_albedo(
        'ceiling/ceiling0.jpg', 'ceiling',
        strength=0.9, rough_base=0.7, rough_amp=0.1, blur=1.2, contrast=1.05,
    )
    # brushed metal (procedural — albedo sources are often flat white)
    gen_brushed_metal('metal')
    print('files:', sorted(os.listdir(OUT)))


if __name__ == '__main__':
    main()
