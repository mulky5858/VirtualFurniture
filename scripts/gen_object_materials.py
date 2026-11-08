#!/usr/bin/env python3
"""Enhance per-object albedo and generate normal/roughness; emit objectsCatalog.js."""
from __future__ import annotations

import json
import math
import os
import random
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
CATALOG_JSON = os.path.join(os.path.dirname(__file__), 'objects_catalog.json')
OUT_OBJECTS = os.path.join(ROOT, 'img', 'objects')
OUT_JS = os.path.join(ROOT, 'js', 'source', 'objectsCatalog.js')


def is_pot(n: int) -> bool:
    return n > 0 and (n & (n - 1)) == 0


def ensure_pot_square(im: Image.Image, size: int = 512) -> Image.Image:
    im = im.convert('RGB')
    w, h = im.size
    # Prefer 512 square for materials; keep larger POT if already square POT
    if w == h and is_pot(w) and w >= 256:
        return im if w <= 1024 else im.resize((1024, 1024), Image.Resampling.LANCZOS)
    return im.resize((size, size), Image.Resampling.LANCZOS)


def enhance_albedo(im: Image.Image, kind: str) -> Image.Image:
    im = ensure_pot_square(im)
    # Avoid pure-white / flat sources looking empty
    extrema = im.convert('L').getextrema()
    flat = extrema[1] - extrema[0] < 8

    if kind == 'wood':
        im = ImageEnhance.Contrast(im).enhance(1.35)
        im = ImageEnhance.Color(im).enhance(1.12)
        im = ImageEnhance.Sharpness(im).enhance(1.35)
        # slight warm push
        r, g, b = im.split()
        r = r.point(lambda v: min(255, int(v * 1.04 + 4)))
        b = b.point(lambda v: max(0, int(v * 0.96)))
        im = Image.merge('RGB', (r, g, b))
    elif kind == 'fabric':
        im = ImageEnhance.Contrast(im).enhance(1.28)
        im = ImageEnhance.Color(im).enhance(1.08)
        detail = im.filter(ImageFilter.DETAIL)
        im = Image.blend(im, detail, 0.45)
        im = ImageEnhance.Sharpness(im).enhance(1.2)
    elif kind == 'metal':
        if flat:
            im = make_brushed_metal_albedo(im.size[0])
        else:
            im = ImageEnhance.Contrast(im).enhance(1.4)
            im = ImageEnhance.Brightness(im).enhance(0.88)
            im = ImageEnhance.Color(im).enhance(0.7)
            im = ImageEnhance.Sharpness(im).enhance(1.25)
    elif kind == 'plastic':
        im = ImageEnhance.Contrast(im).enhance(1.22)
        im = ImageEnhance.Color(im).enhance(0.95)
        im = ImageEnhance.Brightness(im).enhance(0.96)
        im = ImageEnhance.Sharpness(im).enhance(1.15)
    elif kind == 'ceramic':
        im = ImageEnhance.Contrast(im).enhance(1.18)
        im = ImageEnhance.Color(im).enhance(1.05)
        im = ImageEnhance.Sharpness(im).enhance(1.1)
        # soft glaze: slight blur mix
        soft = im.filter(ImageFilter.GaussianBlur(0.6))
        im = Image.blend(im, soft, 0.2)
    elif kind == 'paper':
        im = ImageEnhance.Contrast(im).enhance(1.3)
        im = ImageEnhance.Color(im).enhance(1.05)
        im = ImageEnhance.Sharpness(im).enhance(1.25)
    else:
        im = ImageEnhance.Contrast(im).enhance(1.15)
        im = ImageEnhance.Sharpness(im).enhance(1.1)
    return im


def make_brushed_metal_albedo(size: int = 512) -> Image.Image:
    random.seed(7)
    noise = Image.new('L', (size, size))
    px = noise.load()
    for y in range(size):
        for x in range(size):
            px[x, y] = int(max(0, min(255, 150 + random.gauss(0, 28))))
    streaks = noise.resize((size, max(8, size // 40)), Image.Resampling.BILINEAR)
    streaks = streaks.resize((size, size), Image.Resampling.BILINEAR)
    streaks = ImageEnhance.Contrast(streaks).enhance(1.5)
    base = Image.merge('RGB', (streaks, streaks, streaks))
    # cool metal tint
    r, g, b = base.split()
    r = r.point(lambda v: int(v * 0.92))
    g = g.point(lambda v: int(v * 0.94))
    b = b.point(lambda v: min(255, int(v * 1.05 + 8)))
    return Image.merge('RGB', (r, g, b))


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


def roughness_from_gray(gray: Image.Image, base: float, amp: float, invert: bool = False) -> Image.Image:
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


def write_catalog_js(entries: list) -> None:
    lines = [
        '// Auto-generated by scripts/gen_object_materials.py — do not edit by hand',
        'var OBJECTS_CATALOG = ' + json.dumps(entries, ensure_ascii=False, indent=2) + ';',
        '',
        'function getObjectCatalogEntry (id) {',
        '  for (var i = 0; i < OBJECTS_CATALOG.length; i++) {',
        '    if (OBJECTS_CATALOG[i].id === id) return OBJECTS_CATALOG[i]',
        '  }',
        '  return null',
        '}',
        '',
    ]
    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print('wrote', OUT_JS)


def main() -> None:
    with open(CATALOG_JSON, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    js_entries = []
    for item in catalog:
        oid = item['id']
        slug = item['slug']
        kind = item['kind']
        folder = os.path.join(OUT_OBJECTS, f'{oid:02d}_{slug}')
        os.makedirs(folder, exist_ok=True)

        albedo_paths = []
        main_albedo = None
        skip_enhance = bool(item.get('skipAlbedoEnhance'))
        for i, src_rel in enumerate(item['srcAlbedos']):
            src = os.path.join(ROOT, src_rel.replace('/', os.sep))
            if not os.path.isfile(src):
                print('MISSING', src)
                continue
            out_name = f'albedo{i}.jpg'
            out_path = os.path.join(folder, out_name)
            # 源已是 objects 下成品时跳过再次增强，避免反复叠加滤镜
            if skip_enhance and os.path.normpath(src) == os.path.normpath(out_path):
                im = ensure_pot_square(Image.open(src))
            elif skip_enhance:
                im = ensure_pot_square(Image.open(src))
                if os.path.normpath(src) != os.path.normpath(out_path):
                    im.save(out_path, quality=93)
            else:
                im = enhance_albedo(Image.open(src), kind)
                im.save(out_path, quality=93)
            rel = f'img/objects/{oid:02d}_{slug}/{out_name}'.replace('\\', '/')
            albedo_paths.append(rel)
            if i == 0:
                main_albedo = im
            print('albedo', rel)

        if main_albedo is None:
            print('skip maps, no albedo', oid)
            continue

        gray = luma_img(main_albedo)
        if kind in ('plastic', 'ceramic', 'metal'):
            gray = gray.filter(ImageFilter.GaussianBlur(0.5 if kind != 'metal' else 0.3))
        invert_rough = kind in ('plastic', 'ceramic', 'metal')
        nrm = height_to_normal(gray, strength=float(item['normalStrength']))
        rgh = roughness_from_gray(
            gray,
            base=float(item['roughBase']),
            amp=float(item['roughAmp']),
            invert=invert_rough,
        )
        nrm.save(os.path.join(folder, 'normal.jpg'), quality=92)
        rgh.save(os.path.join(folder, 'roughness.jpg'), quality=92)

        js_entries.append({
            'id': oid,
            'slug': slug,
            'nameZh': item['nameZh'],
            'model': item['model'],
            'kind': kind,
            'albedos': albedo_paths,
            'normal': f'img/objects/{oid:02d}_{slug}/normal.jpg',
            'roughness': f'img/objects/{oid:02d}_{slug}/roughness.jpg',
            'specular': item['specular'],
            'shininess': item['shininess'],
        })

    write_catalog_js(js_entries)
    print('done', len(js_entries), 'objects')


if __name__ == '__main__':
    main()
