var windowCoordinate = Array()
var windowBox = Array()

for (var i = 0; i <= MaxNumberOfObjects; i++) {
  windowBox[i] = Array()
}

// 与 drawThings 一致的物体世界矩阵：T * translateMatrix * Ry * S
function buildObjectWorldMatrix (num, idx) {
  var m = mat4.create()
  mat4.identity(m)
  mat4.translate(m, translateVector[num][idx])
  mat4.multiply(m, translateMatrix[num][idx])
  var ang = rotateAngle[num][idx]
  if (num == 38 && typeof DoorPresentAngle !== 'undefined') {
    ang += DoorPresentAngle[idx]
  }
  mat4.rotateY(m, degToRad(ang))
  mat4.scale(m, translateScale[num][idx])
  return m
}

function getWorldRayFromScreen01 (sx, sy) {
  var ndcX = sx * 2 - 1
  var ndcY = sy * 2 - 1
  var aspect = gl.viewportWidth / gl.viewportHeight
  var tanHalf = Math.tan(degToRad(45 / 2))
  var dir = [ndcX * aspect * tanHalf, ndcY * tanHalf, -1]
  dir = rotateVecX(dir, degToRad(pitch))
  dir = rotateVecY(dir, degToRad(yaw))
  var len = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]) || 1
  return {
    origin: [xPos, yPos, zPos],
    dir: [dir[0] / len, dir[1] / len, dir[2] / len]
  }
}

// 射线与局部轴对齐包围盒求交，返回最近命中距离 t；未命中返回 -1
function rayIntersectLocalAABB (origin, dir, bmin, bmax) {
  var tmin = 0
  var tmax = 1e8
  for (var a = 0; a < 3; a++) {
    if (Math.abs(dir[a]) < 1e-8) {
      if (origin[a] < bmin[a] || origin[a] > bmax[a]) return -1
      continue
    }
    var invD = 1 / dir[a]
    var t0 = (bmin[a] - origin[a]) * invD
    var t1 = (bmax[a] - origin[a]) * invD
    if (t0 > t1) {
      var tmp = t0
      t0 = t1
      t1 = tmp
    }
    if (t0 > tmin) tmin = t0
    if (t1 < tmax) tmax = t1
    if (tmax < tmin) return -1
  }
  if (tmax < 0) return -1
  // 相机在盒内时取 t=0，否则取进入点
  return tmin >= 0 ? tmin : 0
}

// 射线与物体 OBB 求交（把射线变到物体局部空间后测 AABB）
function rayHitObject (ray, num, idx) {
  if (!box[num] || !box[num][0] || !box[num][7]) return -1
  var world = buildObjectWorldMatrix(num, idx)
  var inv = mat4.create()
  mat4.inverse(world, inv)

  var o4 = mat4.multiplyVec4(inv, [ray.origin[0], ray.origin[1], ray.origin[2], 1], [])
  // 方向用 w=0，且不要归一化：同一 t 对应世界射线参数
  var d4 = mat4.multiplyVec4(inv, [ray.dir[0], ray.dir[1], ray.dir[2], 0], [])
  var o = [o4[0], o4[1], o4[2]]
  var d = [d4[0], d4[1], d4[2]]
  if (Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]) < 1e-10) return -1

  var bmin = [box[num][0][0], box[num][0][1], box[num][0][2]]
  var bmax = [box[num][7][0], box[num][7][1], box[num][7][2]]
  return rayIntersectLocalAABB(o, d, bmin, bmax)
}

// 兼容旧调试：仍可计算屏幕包围盒
function picking () {
  for (var i = 0; i <= MaxNumberOfObjects; i++)
    for (var j = 1; j <= MaxNumberOfObjects; j++) {
      if (flagThings[i][j]) {
        windowBox[i][j] = Array()
        var world = buildObjectWorldMatrix(i, j)
        var view = getCameraViewMatrixTemp()
        var mv = mat4.create()
        mat4.multiply(view, world, mv)
        for (var k = 0; k < 8; k++) {
          var m_out = Array()
          var p_out = Array()
          mat4.multiplyVec4(mv, box[i][k], m_out)
          mat4.multiplyVec4(pMatrix, m_out, p_out)
          if (!p_out[3]) continue
          p_out[0] /= p_out[3]
          p_out[1] /= p_out[3]
          p_out[2] /= p_out[3]

          windowCoordinate[k] = Array()
          windowCoordinate[k][0] = (1 + p_out[0]) * 1 / 2
          windowCoordinate[k][1] = (1 + p_out[1]) * 1 / 2
          windowCoordinate[k][2] = (1 + p_out[2]) / 2

          if (k == 0) {
            windowBox[i][j][0] = windowCoordinate[k][0]
            windowBox[i][j][1] = windowCoordinate[k][0]
            windowBox[i][j][2] = windowCoordinate[k][1]
            windowBox[i][j][3] = windowCoordinate[k][1]
          }

          if (windowCoordinate[k][0] < windowBox[i][j][0]) windowBox[i][j][0] = windowCoordinate[k][0]
          if (windowCoordinate[k][0] > windowBox[i][j][1]) windowBox[i][j][1] = windowCoordinate[k][0]
          if (windowCoordinate[k][1] < windowBox[i][j][2]) windowBox[i][j][2] = windowCoordinate[k][1]
          if (windowCoordinate[k][1] > windowBox[i][j][3]) windowBox[i][j][3] = windowCoordinate[k][1]
        }
      }
    }
}

function ThingsOnClick (event) {
  document.getElementById('test2').textContent = '未点选物品。'

  var ray = (typeof lastMouseX === 'number' && typeof lastMouseY === 'number')
    ? getWorldRayFromScreen01(lastMouseX, lastMouseY)
    : getMouseWorldRay(event)

  var bestI = -1
  var bestJ = -1
  var bestT = 1e9

  for (var i = 0; i <= MaxNumberOfObjects; i++) {
    for (var j = 1; j <= MaxNumberOfObjects; j++) {
      if (!flagThings[i][j]) continue
      var t = rayHitObject(ray, i, j)
      if (t >= 0 && t < bestT) {
        bestT = t
        bestI = i
        bestJ = j
      }
    }
  }

  if (bestI < 0) return

  selectedi = bestI
  selectedj = bestJ
  mouseDown[selectedi][selectedj] = true

  if (event.button == 0) {
    leftkey = 1
    oldi = selectedi
    oldj = selectedj
    old = coordinate(selectedi, selectedj)
    canceltype = 1
    CancelPush()
  }
  lagelapsedtozero()
  if (testmode) {
    document.getElementById('test2').textContent =
      '点选的物品为: ' + clicked(selectedi) + '，物品序号为： ' + selectedi +
      ' ，该种类物品编号： ' + selectedj + ' 。'
  } else {
    document.getElementById('test2').textContent = '点选的物品为: ' + clicked(selectedi) + ' 。'
  }

  if (showItemSelectionBox) ItemSelectionBox(selectedi, selectedj)
}
