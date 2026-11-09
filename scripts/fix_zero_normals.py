#!/usr/bin/env python3
"""Patch only zero-length vertex normals; keep existing good normals intact."""
from __future__ import annotations

import json
import math
import os

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'model'))
TARGETS = ['Airconditioning2.json', 'cabinet2.json', 'switch.json']


def fix_file(path: str) -> tuple[int, int]:
  with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)
  pos = data['vertexPositions']
  nrm = list(data['vertexNormals'])
  idx = data['indices']
  nvert = len(pos) // 3

  zeros = []
  for i in range(nvert):
    x, y, z = nrm[i * 3:i * 3 + 3]
    if math.sqrt(x * x + y * y + z * z) < 1e-8:
      zeros.append(i)
  if not zeros:
    return 0, 0

  cx = cy = cz = 0.0
  for i in range(nvert):
    cx += pos[i * 3]
    cy += pos[i * 3 + 1]
    cz += pos[i * 3 + 2]
  inv = 1.0 / max(nvert, 1)
  cx *= inv
  cy *= inv
  cz *= inv

  acc = {i: [0.0, 0.0, 0.0] for i in zeros}
  zero_set = set(zeros)
  for t in range(0, len(idx), 3):
    i0, i1, i2 = idx[t], idx[t + 1], idx[t + 2]
    if not (i0 in zero_set or i1 in zero_set or i2 in zero_set):
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
    for ii in (i0, i1, i2):
      if ii in acc:
        acc[ii][0] += nx
        acc[ii][1] += ny
        acc[ii][2] += nz

  filled = 0
  for i in zeros:
    x, y, z = acc[i]
    length = math.sqrt(x * x + y * y + z * z)
    if length < 1e-12:
      x = pos[i * 3] - cx
      y = pos[i * 3 + 1] - cy
      z = pos[i * 3 + 2] - cz
      length = math.sqrt(x * x + y * y + z * z) or 1.0
    nrm[i * 3] = x / length
    nrm[i * 3 + 1] = y / length
    nrm[i * 3 + 2] = z / length
    filled += 1

  data['vertexNormals'] = nrm
  with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, separators=(',', ':'))
  return len(zeros), filled


def main() -> None:
  for name in TARGETS:
    path = os.path.join(ROOT, name)
    before, filled = fix_file(path)
    print('%s: zero %d -> patched %d' % (name, before, filled))


if __name__ == '__main__':
  main()
