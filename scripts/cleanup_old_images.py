#!/usr/bin/env python3
"""Remove obsolete furniture albedo dirs and unused shared material maps."""
from __future__ import annotations

import json
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / 'img'

# Runtime no longer binds these furniture albedo folders (catalog uses img/objects/)
OLD_DIRS = [
    'lamp',
    'sofa',
    'TV',  # not TV-images
    'table',
    'cabinet',
    'others',
    'Airconditioning',
    'bed',
    'computer',
    'chair',
    'Decorations',
    'frame',
    'door',  # folder; room door texture is img/door.jpg at root
]

# Only wood/plaster/ceiling remain referenced by material.js for rooms
UNUSED_MATERIAL_FILES = [
    'fabric_normal.jpg',
    'fabric_roughness.jpg',
    'metal_normal.jpg',
    'metal_roughness.jpg',
    'plastic_normal.jpg',
    'plastic_roughness.jpg',
    'ceramic_normal.jpg',
    'ceramic_roughness.jpg',
    'paper_normal.jpg',
    'paper_roughness.jpg',
]


def main() -> None:
    removed = []
    for name in OLD_DIRS:
        path = IMG / name
        if path.is_dir():
            shutil.rmtree(path)
            removed.append(str(path.relative_to(ROOT)))
            print('removed dir', path.relative_to(ROOT))
        else:
            print('skip missing', path.relative_to(ROOT))

    mat = IMG / 'material'
    for name in UNUSED_MATERIAL_FILES:
        path = mat / name
        if path.is_file():
            path.unlink()
            removed.append(str(path.relative_to(ROOT)))
            print('removed file', path.relative_to(ROOT))

    # Point catalog sources at generated albedos so regen still works
    catalog_path = ROOT / 'scripts' / 'objects_catalog.json'
    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    for item in catalog:
        folder = f"img/objects/{item['id']:02d}_{item['slug']}"
        n = len(item.get('srcAlbedos', []))
        item['srcAlbedos'] = [f'{folder}/albedo{i}.jpg' for i in range(n)]
        item['skipAlbedoEnhance'] = True
    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('updated', catalog_path.relative_to(ROOT))
    print('total removed', len(removed))


if __name__ == '__main__':
    main()
