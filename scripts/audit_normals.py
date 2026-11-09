#!/usr/bin/env python3
"""Audit / rebuild vertex normals for furniture JSON models.

Detection focuses on real defects (like table.json):
1) vertex normals disagree with their triangle geometric normal
2) near-horizontal top faces have sideways / downward vertex normals
"""
from __future__ import annotations

import argparse
import json
import math
import os
from typing import Any

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'model'))


def load_model(path: str) -> dict[str, Any] | None:
  with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)
  if not isinstance(data, dict):
    return None
  if 'vertexPositions' not in data or 'vertexNormals' not in data or 'indices' not in data:
    return None
  return data


def face_normal(pos: list[float], i0: int, i1: int, i2: int) -> tuple[float, float, float, float]:
  p0 = pos[i0 * 3:i0 * 3 + 3]
  p1 = pos[i1 * 3:i1 * 3 + 3]
  p2 = pos[i2 * 3:i2 * 3 + 3]
  ax, ay, az = p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]
  bx, by, bz = p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]
  nx, ny, nz = ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx
  area = math.sqrt(nx * nx + ny * ny + nz * nz)
  if area < 1e-12:
    return 0.0, 0.0, 0.0, 0.0
  return nx / area, ny / area, nz / area, area


def analyze(path: str) -> dict[str, Any]:
  name = os.path.basename(path)
  data = load_model(path)
  if data is None:
    return {'name': name, 'error': 'unsupported'}

  pos = data['vertexPositions']
  nrm = data['vertexNormals']
  idx = data['indices']
  nvert = len(pos) // 3
  if len(nrm) // 3 != nvert:
    return {'name': name, 'error': 'len_mismatch', 'verts': nvert, 'normals': len(nrm) // 3}

  cx = cy = cz = 0.0
  for i in range(nvert):
    cx += pos[i * 3]
    cy += pos[i * 3 + 1]
    cz += pos[i * 3 + 2]
  inv = 1.0 / max(nvert, 1)
  cx *= inv
  cy *= inv
  cz *= inv

  # Compare with raw winding (no forced outward). Also track whether flipping
  # winding would better match centroid-outward (for rebuild orientation).
  oppose_raw = total = zero = 0
  top_face_count = 0
  top_vert_bad = 0
  top_vert_checked = 0

  for t in range(0, len(idx), 3):
    i0, i1, i2 = idx[t], idx[t + 1], idx[t + 2]
    if max(i0, i1, i2) >= nvert:
      continue
    nx, ny, nz, area = face_normal(pos, i0, i1, i2)
    if area <= 0:
      continue

    # raw agreement
    for ii in (i0, i1, i2):
      vx, vy, vz = nrm[ii * 3:ii * 3 + 3]
      vl = math.sqrt(vx * vx + vy * vy + vz * vz)
      total += 1
      if vl < 1e-8:
        zero += 1
        continue
      vx, vy, vz = vx / vl, vy / vl, vz / vl
      if vx * nx + vy * ny + vz * nz < -0.05:
        oppose_raw += 1

    # horizontal top faces: geo normal mostly +Y
    if ny > 0.75:
      top_face_count += 1
      for ii in (i0, i1, i2):
        vx, vy, vz = nrm[ii * 3:ii * 3 + 3]
        vl = math.sqrt(vx * vx + vy * vy + vz * vz) or 1.0
        vy /= vl
        top_vert_checked += 1
        # sideways / downward on an upward face is the table.json failure mode
        if vy < 0.35:
          top_vert_bad += 1

  # Also count zero-length normals on all vertices (incl. degenerate faces)
  zero_all = 0
  for i in range(nvert):
    vx, vy, vz = nrm[i * 3:i * 3 + 3]
    if math.sqrt(vx * vx + vy * vy + vz * vz) < 1e-8:
      zero_all += 1
  zero = max(zero, zero_all)

  opp = 100.0 * oppose_raw / total if total else 0.0
  top_bad = 100.0 * top_vert_bad / top_vert_checked if top_vert_checked else 0.0

  # Suspect if:
  # - many normals oppose their triangle winding, OR
  # - upward faces have many non-upward vertex normals, OR
  # - zero-length normals exist on used geometry
  suspect = (
    opp >= 12.0
    or (top_vert_checked >= 60 and top_bad >= 35.0)
    or zero_all > 0
  )

  return {
    'name': name,
    'opp': opp,
    'top_bad': top_bad,
    'top_faces': top_face_count,
    'top_checked': top_vert_checked,
    'top_bad_n': top_vert_bad,
    'zero': zero,
    'verts': nvert,
    'faces': len(idx) // 3,
    'suspect': suspect,
    'cx': cx,
    'cy': cy,
    'cz': cz,
  }


def rebuild_normals(data: dict[str, Any]) -> tuple[list[float], int]:
  """Area-weighted vertex normals; triangles oriented outward from centroid.

  Also rewrites triangle winding so indices stay consistent with normals.
  """
  pos = data['vertexPositions']
  idx = list(data['indices'])
  nvert = len(pos) // 3

  cx = cy = cz = 0.0
  for i in range(nvert):
    cx += pos[i * 3]
    cy += pos[i * 3 + 1]
    cz += pos[i * 3 + 2]
  inv = 1.0 / max(nvert, 1)
  cx *= inv
  cy *= inv
  cz *= inv

  acc = [[0.0, 0.0, 0.0] for _ in range(nvert)]
  flipped = 0
  for t in range(0, len(idx), 3):
    i0, i1, i2 = idx[t], idx[t + 1], idx[t + 2]
    if max(i0, i1, i2) >= nvert:
      continue
    p0 = pos[i0 * 3:i0 * 3 + 3]
    p1 = pos[i1 * 3:i1 * 3 + 3]
    p2 = pos[i2 * 3:i2 * 3 + 3]
    ax, ay, az = p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]
    bx, by, bz = p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]
    nx, ny, nz = ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx
    area = math.sqrt(nx * nx + ny * ny + nz * nz)
    if area < 1e-12:
      continue
    fx = (p0[0] + p1[0] + p2[0]) / 3.0
    fy = (p0[1] + p1[1] + p2[1]) / 3.0
    fz = (p0[2] + p1[2] + p2[2]) / 3.0
    if nx * (fx - cx) + ny * (fy - cy) + nz * (fz - cz) < 0:
      nx, ny, nz = -nx, -ny, -nz
      idx[t + 1], idx[t + 2] = i2, i1
      flipped += 1
    for ii in (idx[t], idx[t + 1], idx[t + 2]):
      acc[ii][0] += nx
      acc[ii][1] += ny
      acc[ii][2] += nz

  data['indices'] = idx

  ys = [pos[i + 1] for i in range(0, len(pos), 3)]
  ymax = max(ys)
  new: list[float] = []
  for i in range(nvert):
    x, y, z = acc[i]
    length = math.sqrt(x * x + y * y + z * z)
    if length < 1e-12:
      if pos[i * 3 + 1] >= ymax - 1e-4:
        new.extend([0.0, 1.0, 0.0])
      else:
        x = pos[i * 3] - cx
        y = pos[i * 3 + 1] - cy
        z = pos[i * 3 + 2] - cz
        length = math.sqrt(x * x + y * y + z * z) or 1.0
        new.extend([x / length, y / length, z / length])
      continue
    new.extend([x / length, y / length, z / length])
  return new, flipped


def main() -> None:
  parser = argparse.ArgumentParser()
  parser.add_argument('--fix', action='store_true', help='Rebuild normals for suspect models')
  parser.add_argument('--all', action='store_true', help='With --fix, rebuild every model')
  args = parser.parse_args()

  names = sorted(n for n in os.listdir(ROOT) if n.endswith('.json'))
  results = [analyze(os.path.join(ROOT, name)) for name in names]

  print(
    f"{'model':28} {'opp%':>6} {'topBad%':>8} {'topF':>5} "
    f"{'badN':>5} {'zero':>5} {'verts':>6}"
  )
  suspects: list[str] = []
  for r in sorted(results, key=lambda x: (-(x.get('opp') or 0), -(x.get('top_bad') or 0), x['name'])):
    if 'error' in r:
      print(f"{r['name']:28} ERROR {r['error']}")
      continue
    flag = ' <<' if r['suspect'] else ''
    if r['suspect']:
      suspects.append(r['name'])
    print(
      f"{r['name']:28} {r['opp']:6.1f} {r['top_bad']:8.1f} {r['top_faces']:5d} "
      f"{r['top_bad_n']:5d} {r['zero']:5d} {r['verts']:6d}{flag}"
    )

  print('---')
  print(f'suspect count: {len(suspects)}')
  print('suspects:', ', '.join(suspects) if suspects else '(none)')

  if not args.fix:
    return

  targets = names if args.all else suspects
  for name in targets:
    path = os.path.join(ROOT, name)
    data = load_model(path)
    if data is None:
      print('skip', name)
      continue
    before = analyze(path)
    new_nrm, flipped = rebuild_normals(data)
    data['vertexNormals'] = new_nrm
    with open(path, 'w', encoding='utf-8') as f:
      json.dump(data, f, separators=(',', ':'))
    after = analyze(path)
    print(
      f"fixed {name}: opp {before.get('opp', 0):.1f}->{after.get('opp', 0):.1f}%, "
      f"topBad {before.get('top_bad', 0):.1f}->{after.get('top_bad', 0):.1f}%, "
      f"zero {before.get('zero', 0)}->{after.get('zero', 0)}, "
      f"flippedFaces {flipped}"
    )


if __name__ == '__main__':
  main()
