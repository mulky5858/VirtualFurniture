#!/usr/bin/env python3
import json
import math
import os

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'model'))

print('%28s %5s %7s %5s %8s %s' % ('model', 'zero', 'topUp%', 'topN', 'oppRaw%', 'note'))
for name in sorted(os.listdir(ROOT)):
  if not name.endswith('.json'):
    continue
  with open(os.path.join(ROOT, name), 'r', encoding='utf-8') as f:
    d = json.load(f)
  if not isinstance(d, dict) or 'vertexPositions' not in d:
    continue
  pos = d['vertexPositions']
  nrm = d['vertexNormals']
  idx = d['indices']
  nvert = len(pos) // 3
  zero = 0
  for i in range(nvert):
    if math.sqrt(nrm[i * 3] ** 2 + nrm[i * 3 + 1] ** 2 + nrm[i * 3 + 2] ** 2) < 1e-8:
      zero += 1
  ys = [pos[i + 1] for i in range(0, len(pos), 3)]
  ymax = max(ys)
  ymin = min(ys)
  thr = ymax - max(0.03 * (ymax - ymin), 1e-4)
  top = [i for i in range(nvert) if pos[i * 3 + 1] >= thr]
  up = 0
  for i in top:
    vl = math.sqrt(nrm[i * 3] ** 2 + nrm[i * 3 + 1] ** 2 + nrm[i * 3 + 2] ** 2) or 1.0
    if nrm[i * 3 + 1] / vl > 0.5:
      up += 1
  top_up = 100.0 * up / len(top) if top else 100.0
  opp = tot = 0
  for t in range(0, len(idx), 3):
    i0, i1, i2 = idx[t], idx[t + 1], idx[t + 2]
    ax = pos[i1 * 3] - pos[i0 * 3]
    ay = pos[i1 * 3 + 1] - pos[i0 * 3 + 1]
    az = pos[i1 * 3 + 2] - pos[i0 * 3 + 2]
    bx = pos[i2 * 3] - pos[i0 * 3]
    by = pos[i2 * 3 + 1] - pos[i0 * 3 + 1]
    bz = pos[i2 * 3 + 2] - pos[i0 * 3 + 2]
    nx, ny, nz = ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx
    length = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
    nx, ny, nz = nx / length, ny / length, nz / length
    for ii in (i0, i1, i2):
      vx, vy, vz = nrm[ii * 3], nrm[ii * 3 + 1], nrm[ii * 3 + 2]
      vl = math.sqrt(vx * vx + vy * vy + vz * vz) or 1.0
      tot += 1
      if (vx * nx + vy * ny + vz * nz) / vl < -0.05:
        opp += 1
  oppct = 100.0 * opp / tot if tot else 0.0
  note = ''
  if zero:
    note += ' ZERO'
  if top and top_up < 55:
    note += ' TOP_SIDEWAYS'
  if oppct >= 12:
    note += ' OPP'
  print('%28s %5d %7.1f %5d %8.1f%s' % (name, zero, top_up, len(top), oppct, note))
